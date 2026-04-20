import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db/index.js'
import { liteSubmissions } from '../db/schema.js'
import { liteAuditLimiter, submitLimiter } from '../middleware/rateLimit.js'
import { sendLiteSubmissionNotification } from '../email.js'
import { randomUUID } from 'crypto'

const router = Router()

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM = `Ти - провідний Instagram-маркетолог для health/wellness-спеціалістів в Україні.
Аналізуєш профіль нутриціолога / health-коуча / косметолога і видаєш конкретний аудит з actionable рекомендаціями.

Правила:
- Тільки українська мова
- Без GPT-стилю: жодних "звісно", "безумовно", "підсумовуючи", "важливо зазначити"
- Аудит показує реальні проблеми, а не "все добре, але можна покращити"
- Bio max 150 символів, без хештегів, з чітким CTA у кожному варіанті
- Кожен fix - конкретна дія, яку можна зробити сьогодні
- Швидкі дії - те, що займає менше 30 хвилин і дає помітний ефект
- ЗАБОРОНЕНО: "зробіть профіль більш привабливим", "додайте більше цінності", загальні поради без прив'язки до ніші
- Відповідай виключно JSON без markdown-блоків`

router.post('/audit', liteAuditLimiter, async (req, res) => {
  const { profession, bio, instagramUrl } = req.body as {
    profession?: string
    bio?: string
    instagramUrl?: string
  }

  if (!profession || !bio) {
    res.status(400).json({ error: 'profession and bio are required' })
    return
  }

  const prompt = `Аналізуй Instagram-профіль спеціаліста.

Спеціалізація: ${profession}
Поточне Bio: ${bio}${instagramUrl ? `\nInstagram: ${instagramUrl}` : ''}

Зроби детальний аудит. Поверни JSON без коментарів:
{
  "overallScore": <число 1-100>,
  "summary": "2-3 речення: загальний стан профілю і головна проблема - конкретно, без лестощів",
  "scores": [
    {
      "category": "Bio та перше враження",
      "score": <1-10>,
      "label": "Добре",
      "issue": "Конкретна проблема - що саме не так",
      "fix": "Конкретне рішення - що саме змінити"
    },
    { "category": "Позиціонування", "score": 0, "label": "Потребує роботи", "issue": "...", "fix": "..." },
    { "category": "Офер і CTA", "score": 0, "label": "Критично", "issue": "...", "fix": "..." },
    { "category": "Цільова аудиторія", "score": 0, "label": "Потребує роботи", "issue": "...", "fix": "..." },
    { "category": "Довіра і соціальний доказ", "score": 0, "label": "Потребує роботи", "issue": "...", "fix": "..." }
  ],
  "bioVariants": [
    "Bio варіант 1 (до 150 символів, без хештегів, з конкретним CTA)",
    "Bio варіант 2",
    "Bio варіант 3"
  ],
  "highlightsStructure": [
    "Highlights 1: назва - що покласти (конкретно)",
    "Highlights 2: назва - ...",
    "Highlights 3: назва - ...",
    "Highlights 4: назва - ...",
    "Highlights 5: назва - ..."
  ],
  "pinnedPostIdeas": [
    "Закріплений пост 1 - тема і формат (чому саме цей)",
    "Закріплений пост 2",
    "Закріплений пост 3"
  ],
  "quickWins": [
    "Дія 1 - що зробити сьогодні (конкретно, до 30 хвилин)",
    "Дія 2",
    "Дія 3"
  ]
}

label для кожної категорії: якщо score >= 7 то "Добре", якщо 4-6 то "Потребує роботи", якщо <= 3 то "Критично".`

  try {
    const msg = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1800,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const audit = JSON.parse(clean)
    res.json(audit)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[lite/audit]', detail)
    res.status(500).json({ error: 'Generation failed', detail })
  }
})

// ── form submissions → Telegram notification ──────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  name: 'Ім\'я',
  niche: 'Ніша',
  instagram: 'Instagram',
  mainPain: 'Головний біль',
  why: 'Чому зацікавились',
  betaConsent: 'Beta-тестер',
  hasActivePractice: 'Активна практика',
  currentOffers: 'Поточні офери',
  instagramStatus: 'Статус Instagram',
  mainGoal: 'Головна ціль',
  whyAccess: 'Чому хоче beta',
  contact: 'Контакт',
  whatToSee: 'Що хоче побачити в демо',
}

const TYPE_LABEL: Record<string, string> = {
  waitlist: '📋 Нова заявка у Waitlist',
  beta: '🚀 Нова Beta-заявка',
  demo: '📅 Запит на Demo',
}

function buildTelegramText(type: string, data: Record<string, unknown>): string {
  const ts = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })
  const header = TYPE_LABEL[type] ?? `📥 ${type}`
  const lines = [header, `🕐 ${ts}`, '']
  for (const [key, val] of Object.entries(data)) {
    if (key === 'submittedAt' || val === '' || val === null || val === undefined) continue
    const label = FIELD_LABELS[key] ?? key
    const value = typeof val === 'boolean' ? (val ? 'Так' : 'Ні') : String(val)
    lines.push(`${label}: ${value}`)
  }
  return lines.join('\n')
}

async function notifyTelegram(type: string, data: Record<string, unknown>): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  const text = buildTelegramText(type, data)
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

router.post('/submit', submitLimiter, async (req, res) => {
  const { type, data } = req.body as { type?: string; data?: Record<string, unknown> }
  if (!type || !data) {
    res.status(400).json({ error: 'type and data are required' })
    return
  }
  try {
    db.insert(liteSubmissions).values({
      id: randomUUID(),
      type: type as 'waitlist' | 'beta' | 'demo',
      data: JSON.stringify(data),
      createdAt: new Date(),
    }).run()
  } catch (err) {
    console.error('[lite/submit/db]', err)
  }

  try {
    await notifyTelegram(type, data)
  } catch (err) {
    console.error('[lite/submit/telegram]', err)
  }

  sendLiteSubmissionNotification(
    type as 'waitlist' | 'beta' | 'demo',
    data
  ).catch(err => console.error('[lite/submit/email]', err))

  res.json({ ok: true })
})

export default router
