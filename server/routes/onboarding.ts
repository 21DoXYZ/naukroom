import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { businessProfiles, users } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'

const router = Router()
router.use(requireAuth)

const ARRAY_FIELDS = new Set(['goals', 'postScreenshots'])

function deserializeProfile(profile: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(profile)) {
    if (ARRAY_FIELDS.has(key) && typeof val === 'string') {
      try { result[key] = JSON.parse(val) } catch { result[key] = [] }
    } else {
      result[key] = val
    }
  }
  return result
}

router.get('/profile', (req: AuthRequest, res) => {
  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()
  res.json(profile ? deserializeProfile(profile as Record<string, unknown>) : null)
})

function serializeFields(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    result[key] = Array.isArray(val) ? JSON.stringify(val) : val
  }
  return result
}

router.post('/profile', (req: AuthRequest, res) => {
  const raw = req.body as Record<string, unknown>
  const data = serializeFields(raw)
  const now = new Date()

  const existing = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()

  if (existing) {
    db.update(businessProfiles)
      .set({ ...data, updatedAt: now })
      .where(eq(businessProfiles.userId, req.userId!))
      .run()
    res.json({ ok: true })
  } else {
    db.insert(businessProfiles).values({
      id: randomUUID(),
      userId: req.userId!,
      ...data,
      updatedAt: now,
    } as typeof businessProfiles.$inferInsert).run()
    res.json({ ok: true })
  }
})

router.post('/complete', (req: AuthRequest, res) => {
  db.update(users)
    .set({ onboardingStatus: 'completed' })
    .where(eq(users.id, req.userId!))
    .run()
  track('onboarding_completed', req.userId!)
  res.json({ ok: true })
})

export default router
