import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, businessProfiles, generatedOutputs } from '../db/schema.js'
import { requireAdmin, type AuthRequest } from '../middleware/auth.js'

const router = Router()
router.use(requireAdmin)

router.get('/users', (_req, res) => {
  const list = db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
    onboardingStatus: users.onboardingStatus,
    createdAt: users.createdAt,
  }).from(users).all()
  res.json(list)
})

router.get('/users/:id', (req, res) => {
  const user = db.select().from(users).where(eq(users.id, req.params.id)).get()
  const profile = db.select().from(businessProfiles).where(eq(businessProfiles.userId, req.params.id)).get()
  const outputs = db.select().from(generatedOutputs)
    .where(eq(generatedOutputs.userId, req.params.id))
    .orderBy(desc(generatedOutputs.createdAt))
    .all()
  res.json({ user, profile, outputs })
})

router.patch('/outputs/:id', (req: AuthRequest, res) => {
  const { status, adminNotes, content } = req.body as {
    status?: string
    adminNotes?: string
    content?: string
  }
  db.update(generatedOutputs)
    .set({
      ...(status && { status: status as 'pending' | 'approved' | 'needs_review' }),
      ...(adminNotes !== undefined && { adminNotes }),
      ...(content && { content }),
      ...(status === 'approved' && { approvedBy: req.userId }),
      updatedAt: new Date(),
    })
    .where(eq(generatedOutputs.id, req.params.id))
    .run()
  res.json({ ok: true })
})

export default router
