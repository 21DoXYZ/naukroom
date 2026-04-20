interface Req {
  method: string
  body: {
    type: 'waitlist' | 'beta' | 'demo'
    data: Record<string, unknown>
  }
}

interface ResHelper {
  status(code: number): ResHelper
  json(data: unknown): void
  setHeader(name: string, value: string): void
}

function formatTelegramMessage(type: string, data: Record<string, unknown>): string {
  const ts = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })

  const typeLabel: Record<string, string> = {
    waitlist: '📋 Нова заявка у Waitlist',
    beta: '🚀 Нова Beta-заявка',
    demo: '📅 Запит на Demo',
  }

  const header = typeLabel[type] ?? `📥 ${type}`

  const lines: string[] = [
    header,
    `🕐 ${ts}`,
    '',
  ]

  const fieldLabels: Record<string, string> = {
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

  for (const [key, val] of Object.entries(data)) {
    if (key === 'submittedAt' || val === '' || val === null || val === undefined) continue
    const label = fieldLabels[key] ?? key
    const value = typeof val === 'boolean' ? (val ? 'Так' : 'Ні') : String(val)
    lines.push(`${label}: ${value}`)
  }

  return lines.join('\n')
}

async function sendTelegram(token: string, chatId: string, text: string): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  })
}

export default async function handler(req: Req, res: ResHelper) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(200).json({})
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { type, data } = req.body

  if (!type || !data) {
    res.status(400).json({ error: 'type and data are required' })
    return
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (token && chatId) {
    try {
      const text = formatTelegramMessage(type, data)
      await sendTelegram(token, chatId, text)
    } catch (err) {
      console.error('[submit/telegram]', err)
    }
  }

  res.status(200).json({ ok: true })
}
