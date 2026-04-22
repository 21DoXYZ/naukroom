import { Router } from 'express'
import { eq, desc } from 'drizzle-orm'
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
import { runQA } from '../ai/qa-rewriter.js'
import { composeMarketingPack } from '../ai/marketing-pack-composer.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'

const router = Router()
router.use(requireAuth)

router.post('/improve-answer', async (req: AuthRequest, res) => {
  const { question, answer } = req.body as { question?: string; answer?: string }
  if (!question || !answer) {
    res.status(400).json({ error: 'question і answer обов\'язкові' })
    return
  }
  if (answer.trim().length < 10) {
    res.json({ quality: 'too_vague', feedback: 'Відповідь занадто коротка. Розкрий детальніше.', suggestion: '' })
    return
  }
  const result = await improveAnswer(question, answer)
  res.json(result)
})

router.post('/positioning-summary', async (req: AuthRequest, res) => {
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
    const summary = await generatePositioningSummary(profile as Record<string, unknown>)
    const qa = await runQA('positioning_summary', summary as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'positioning_summary',
      content: JSON.stringify(summary),
      qaScore: JSON.stringify(qa),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: summary, outputId: id, qa })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка генерації'
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
    const qa = await runQA('profile_audit', audit as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'profile_audit',
      content: JSON.stringify(audit),
      qaScore: JSON.stringify(qa),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: audit, outputId: id, qa })}\n\n`)
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
    const qa = await runQA('offer', offer as Record<string, unknown>)

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'offer',
      content: JSON.stringify(offer),
      qaScore: JSON.stringify(qa),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    res.write(`data: ${JSON.stringify({ status: 'done', result: offer, outputId: id, qa })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка генерації'
    res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
    res.end()
  }
})

type SseOutputType = 'profile_packaging' | 'lead_magnet' | 'funnel' | 'content_pack'

function sseRoute(
  type: SseOutputType,
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
      const qa = await runQA(type, result as Record<string, unknown>)

      const existingCount = db.select({ id: generatedOutputs.id }).from(generatedOutputs)
        .where(eq(generatedOutputs.userId, req.userId!)).all().length

      const id = randomUUID()
      db.insert(generatedOutputs).values({
        id, userId: req.userId!, type, content: JSON.stringify(result),
        qaScore: JSON.stringify(qa), status: 'pending', createdAt: new Date(),
      }).run()

      if (existingCount === 0) track('first_generation_completed', req.userId!, { type })
      track('generation_completed', req.userId!, { type })

      res.write(`data: ${JSON.stringify({ status: 'done', result, outputId: id, qa })}\n\n`)
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

router.post('/marketing-pack', async (req: AuthRequest, res) => {
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
    const allOutputs = db.select().from(generatedOutputs)
      .where(eq(generatedOutputs.userId, req.userId!))
      .orderBy(desc(generatedOutputs.createdAt))
      .all()

    // Latest output of each type
    const latestByType: Record<string, unknown> = {}
    for (const o of allOutputs) {
      if (!latestByType[o.type]) {
        try { latestByType[o.type] = JSON.parse(o.content) } catch { /* skip */ }
      }
    }

    // Trim large content_pack: pass only first 3 scripts + connectionMap + calendar
    // to keep the marketing-pack-composer prompt within reasonable size
    if (latestByType.content_pack && typeof latestByType.content_pack === 'object') {
      const cp = latestByType.content_pack as Record<string, unknown>
      latestByType.content_pack = {
        scripts: Array.isArray(cp.scripts) ? cp.scripts.slice(0, 3) : [],
        connectionMap: Array.isArray(cp.connectionMap) ? cp.connectionMap.slice(0, 3) : [],
        contentCalendar: cp.contentCalendar,
        hashtagSets: cp.hashtagSets,
      }
    }

    const pack = await composeMarketingPack(
      profile as Record<string, unknown>,
      latestByType
    )

    const id = randomUUID()
    db.insert(generatedOutputs).values({
      id,
      userId: req.userId!,
      type: 'marketing_pack',
      content: JSON.stringify(pack),
      status: 'pending',
      createdAt: new Date(),
    }).run()

    track('export_completed', req.userId!)

    res.write(`data: ${JSON.stringify({ status: 'done', result: pack, outputId: id })}\n\n`)
    res.end()
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Помилка генерації'
    res.write(`data: ${JSON.stringify({ status: 'error', error: msg })}\n\n`)
    res.end()
  }
})

export default router
