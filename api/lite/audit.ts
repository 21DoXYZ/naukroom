import Anthropic from '@anthropic-ai/sdk'

interface Req {
  method: string
  body: { profession?: string; bio?: string; instagramUrl?: string }
}

interface ResHelper {
  status(code: number): ResHelper
  json(data: unknown): void
  setHeader(name: string, value: string): void
}

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

  const { profession, bio, instagramUrl } = req.body

  if (!profession || !bio) {
    res.status(400).json({ error: 'profession and bio are required' })
    return
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const audit = JSON.parse(clean)
    res.status(200).json(audit)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[lite/audit]', msg)
    res.status(500).json({ error: 'Generation failed', detail: msg })
  }
}
