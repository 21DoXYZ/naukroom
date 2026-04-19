import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret'

function makeToken(userId: string, role: string) {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '30d' })
}

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string
    password?: string
    name?: string
  }

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль минимум 6 символов' })
    return
  }

  const existing = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()
  if (existing) {
    res.status(409).json({ error: 'Этот email уже зарегистрирован' })
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
  res.json({ token: makeToken(id, 'user'), user: { id, email: email.toLowerCase(), name, role: 'user', onboardingStatus: 'not_started' } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' })
    return
  }

  const user = db.select().from(users).where(eq(users.email, email.toLowerCase())).get()
  if (!user) {
    res.status(401).json({ error: 'Неверный email или пароль' })
    return
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    res.status(401).json({ error: 'Неверный email или пароль' })
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

export default router
