import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { businessProfiles, users } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'

const router = Router()
router.use(requireAuth)

router.get('/profile', (req: AuthRequest, res) => {
  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()
  res.json(profile ?? null)
})

router.post('/profile', (req: AuthRequest, res) => {
  const data = req.body as Record<string, unknown>
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
