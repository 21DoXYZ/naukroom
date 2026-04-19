import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
import { db } from '../db/index.js'
import { users, businessProfiles, generatedOutputs } from '../db/schema.js'
import { requireAdmin, type AuthRequest } from '../middleware/auth.js'
import { generatePositioningSummary } from '../ai/positioning-summary.js'
import { generateProfileAudit } from '../ai/profile-auditor.js'
import { generateOffer } from '../ai/offer-builder.js'
import { generateProfilePackaging } from '../ai/profile-packager.js'
import { generateLeadMagnets } from '../ai/lead-magnet.js'
import { generateFunnel } from '../ai/funnel-builder.js'
import { generateContentPack } from '../ai/content-engine.js'
import { runQA } from '../ai/qa-rewriter.js'

const GENERATORS: Record<string, (p: Record<string, unknown>) => Promise<unknown>> = {
  positioning_summary: generatePositioningSummary,
  profile_audit: generateProfileAudit,
  offer: generateOffer,
  profile_packaging: generateProfilePackaging,
  lead_magnet: generateLeadMagnets,
  funnel: generateFunnel,
  content_pack: generateContentPack,
}

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

router.post('/outputs/:id/regenerate', async (req: AuthRequest, res) => {
  const output = db.select().from(generatedOutputs)
    .where(eq(generatedOutputs.id, req.params.id)).get()

  if (!output) { res.status(404).json({ error: 'Output не знайдено' }); return }

  const generator = GENERATORS[output.type]
  if (!generator) { res.status(400).json({ error: `Тип ${output.type} не підтримує регенерацію` }); return }

  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, output.userId)).get()

  if (!profile) { res.status(404).json({ error: 'Профіль користувача не знайдено' }); return }

  try {
    const result = await generator(profile as Record<string, unknown>)
    const qa = await runQA(output.type, result as Record<string, unknown>)

    db.update(generatedOutputs).set({
      content: JSON.stringify(result),
      qaScore: JSON.stringify(qa),
      status: 'pending',
      adminNotes: `Перегенеровано адміном ${req.userId} • ${new Date().toLocaleString('uk')}`,
      updatedAt: new Date(),
    }).where(eq(generatedOutputs.id, req.params.id)).run()

    const updated = db.select().from(generatedOutputs)
      .where(eq(generatedOutputs.id, req.params.id)).get()

    res.json({ ok: true, output: updated })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка регенерації'
    res.status(500).json({ error: msg })
  }
})

export default router
