import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { businessProfiles, generatedOutputs } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { improveAnswer } from '../ai/answer-improver.js'
import { generatePositioningSummary } from '../ai/positioning-summary.js'
import { generateProfileAudit } from '../ai/profile-auditor.js'
import { generateOffer } from '../ai/offer-builder.js'
import { generateProfilePackaging } from '../ai/profile-packager.js'
import { generateLeadMagnets } from '../ai/lead-magnet.js'
import { generateFunnel } from '../ai/funnel-builder.js'
import { generateContentPack } from '../ai/content-engine.js'
import { randomUUID } from 'crypto'

const router = Router()
router.use(requireAuth)

router.post('/improve-answer', async (req: AuthRequest, res) => {
  const { question, answer } = req.body as { question?: string; answer?: string }
  if (!question || !answer) {
    res.status(400).json({ error: 'question и answer обязательны' })
    return
  }
  if (answer.trim().length < 10) {
    res.json({ quality: 'too_vague', feedback: 'Ответ слишком короткий. Раскрой подробнее.', suggestion: '' })
    return
  }
  const result = await improveAnswer(question, answer)
  res.json(result)
})

router.post('/positioning-summary', async (req: AuthRequest, res) => {
  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()

  if (!profile) {
    res.status(404).json({ error: 'Профиль не найден' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.write('data: {"status":"generating"}\n\n')

  try {
    const summary = await generatePositioningSummary(profile as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'positioning_summary',
      content: JSON.stringify(summary),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: summary, outputId: id })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Ошибка генерации'
    res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
    res.end()
  }
})

router.post('/profile-audit', async (req: AuthRequest, res) => {
  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()

  if (!profile) {
    res.status(404).json({ error: 'Профіль не знайдено' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.write('data: {"status":"generating"}\n\n')

  try {
    const audit = await generateProfileAudit(profile as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'profile_audit',
      content: JSON.stringify(audit),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: audit, outputId: id })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка генерації'
    res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
    res.end()
  }
})

router.post('/offer', async (req: AuthRequest, res) => {
  const profile = db.select().from(businessProfiles)
    .where(eq(businessProfiles.userId, req.userId!)).get()

  if (!profile) {
    res.status(404).json({ error: 'Профіль не знайдено' })
    return
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.write('data: {"status":"generating"}\n\n')

  try {
    const offer = await generateOffer(profile as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'offer',
      content: JSON.stringify(offer),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: offer, outputId: id })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка генерації'
    res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
    res.end()
  }
})

function sseRoute(
  type: 'profile_packaging' | 'lead_magnet' | 'funnel',
  generator: (p: Record<string, unknown>) => Promise<unknown>
) {
  return async (req: AuthRequest, res: import('express').Response) => {
    const profile = db.select().from(businessProfiles)
      .where(eq(businessProfiles.userId, req.userId!)).get()
    if (!profile) { res.status(404).json({ error: 'Профіль не знайдено' }); return }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.write('data: {"status":"generating"}\n\n')

    try {
      const result = await generator(profile as Record<string, unknown>)
      const id = randomUUID()
      db.insert(generatedOutputs).values({
        id, userId: req.userId!, type, content: JSON.stringify(result),
        status: 'pending', createdAt: new Date(),
      }).run()
      res.write(`data: ${JSON.stringify({ status: 'done', result, outputId: id })}\n\n`)
      res.end()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Помилка генерації'
      res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
      res.end()
    }
  }
}

router.post('/profile-packaging', sseRoute('profile_packaging', generateProfilePackaging))
router.post('/lead-magnets', sseRoute('lead_magnet', generateLeadMagnets))
router.post('/funnel', sseRoute('funnel', generateFunnel))
router.post('/content-pack', sseRoute('content_pack', generateContentPack))

export default router
