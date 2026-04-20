import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'
import { sendWelcomeEmail, sendPasswordResetEmail } from '../email.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'
const APP_URL = process.env.APP_URL ?? 'https://naukroom.vercel.app'

// In-memory store for reset tokens (fine for single-instance SQLite backend)
const resetTokens = new Map<string, { userId: string; expiresAt: number }>()

function makeToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' })
}

router.post('/register', authLimiter, async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email і пароль обов\'язкові' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль мінімум 6 символів' })
    return
  }

  const existing = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()
  if (existing) {
    res.status(409).json({ error: 'Цей email вже зареєстровано' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  const id = randomUUID()
  const now = new Date()

  db.insert(users).values({
    id,
    email: email.toLowerCase(),
    password: hashed,
    name: name ?? null,
    role: 'user',
    onboardingStatus: 'not_started',
    createdAt: now,
  }).run()

  track('registration_completed', id, { email: email.toLowerCase() })

  sendWelcomeEmail(email.toLowerCase(), name ?? '').catch(err =>
    console.error('[email/welcome]', err)
  )

  res.json({
    token: makeToken(id, 'user'),
    user: { id, email: email.toLowerCase(), name, role: 'user', onboardingStatus: 'not_started' },
  })
})

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email і пароль обов\'язкові' })
    return
  }

  const user = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()
  if (!user) {
    res.status(401).json({ error: 'Невірний email або пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Невірний email або пароль' })
    return
  }

  res.json({
    token: makeToken(user.id, user.role),
    user: { id: user.id, email: user.email, name: user.name, role: user.role, onboardingStatus: user.onboardingStatus },
  })
})

router.get('/me', requireAuth, (req: AuthRequest, res) => {
  const user = db.select().from(users).where(eq(users.id, req.userId!)).get()
  if (!user) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, onboardingStatus: user.onboardingStatus })
})

router.post('/forgot-password', authLimiter, async (req, res) => {
  const { email } = req.body as { email?: string }
  if (!email) {
    res.status(400).json({ error: 'Вкажіть email' })
    return
  }

  const user = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()

  // Always return success (don't reveal if email exists)
  if (user) {
    const token = randomUUID()
    resetTokens.set(token, {
      userId: user.id,
      expiresAt: Date.now() + 60 * 60 * 1000, // 1 hour
    })

    const resetUrl = `${APP_URL}/reset-password?token=${token}`
    sendPasswordResetEmail(user.email, resetUrl).catch(err =>
      console.error('[email/reset]', err)
    )
  }

  res.json({ ok: true, message: 'Якщо цей email зареєстровано - ми надіслали посилання' })
})

router.post('/reset-password', authLimiter, async (req, res) => {
  const { token, password } = req.body as { token?: string; password?: string }

  if (!token || !password) {
    res.status(400).json({ error: 'Токен і пароль обов\'язкові' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль мінімум 6 символів' })
    return
  }

  const entry = resetTokens.get(token)
  if (!entry || entry.expiresAt < Date.now()) {
    resetTokens.delete(token)
    res.status(400).json({ error: 'Посилання недійсне або прострочене' })
    return
  }

  const hashed = await bcrypt.hash(password, 10)
  db.update(users).set({ password: hashed }).where(eq(users.id, entry.userId)).run()
  resetTokens.delete(token)

  res.json({ ok: true })
})

export default router
