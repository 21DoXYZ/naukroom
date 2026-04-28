import { Router } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../db/index.js'
import { businessProfiles, users } from '../db/schema.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'
import { randomUUID } from 'crypto'
import { track } from '../analytics.js'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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

router.post('/analyze-instagram', async (req: AuthRequest, res) => {
  const { handle } = req.body as { handle?: string }
  if (!handle) { res.status(400).json({ error: 'handle required' }); return }

  const username = handle.trim().replace(/^@/, '').replace(/.*instagram\.com\/([A-Za-z0-9._]+).*/, '$1')
  if (!username) { res.status(400).json({ error: 'Invalid handle' }); return }

  const apifyToken = process.env.APIFY_TOKEN
  if (!apifyToken) { res.status(503).json({ error: 'not_configured' }); return }

  try {
    const apifyRes = await fetch(
      `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernames: [username] }),
        signal: AbortSignal.timeout(55_000),
      }
    )
    if (!apifyRes.ok) { res.status(502).json({ error: 'fetch_failed' }); return }

    const items = await apifyRes.json() as Record<string, unknown>[]
    if (!items?.length) { res.status(404).json({ error: 'not_found' }); return }

    const d = items[0]
    const isPrivate = Boolean(d.private ?? d.isPrivate)
    const fullName = String(d.fullName ?? '')
    const bio = isPrivate ? '' : String(d.biography ?? d.bio ?? '')

    if (!bio && !fullName) {
      res.json({ instagram: { username, fullName, bio, isPrivate }, prefill: { instagramUrl: `@${username}` } })
      return
    }

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `Витягни дані з Instagram-профілю. Повертай JSON без markdown.

Ім'я: ${fullName}
Bio: ${bio}

JSON:
{
  "name": "ім'я людини (з fullName, ≤30 символів)",
  "profession": "професія або посада (з bio, якщо є, інакше порожньо)",
  "specialization": "вузька ніша або спеціалізація (з bio, якщо є, інакше порожньо)",
  "clientType": "кого обслуговує (з bio, якщо є, інакше порожньо)",
  "clientGenderAge": "стать і вік клієнтів (якщо згадано в bio, інакше порожньо)"
}

Не вигадуй — лише те що прямо або явно в bio.`
      }],
    })

    const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()

    let extracted: Record<string, string> = {}
    try { extracted = JSON.parse(text) } catch { /* use empty */ }

    const prefill: Record<string, string> = { instagramUrl: `@${username}` }
    for (const key of ['name', 'profession', 'specialization', 'clientType', 'clientGenderAge']) {
      if (extracted[key] && String(extracted[key]).trim()) {
        prefill[key] = String(extracted[key]).trim()
      }
    }

    res.json({
      instagram: { username, fullName, bio, isPrivate, followers: Number(d.followersCount ?? 0) },
      prefill,
    })
  } catch (err) {
    console.error('[analyze-instagram]', err)
    res.status(500).json({ error: 'Помилка аналізу' })
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
