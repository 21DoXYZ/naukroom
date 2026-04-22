import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AuditScore {
  category: string
  score: number   // 1–10
  label: string
  issue: string
  fix: string
}

export interface ProfileAudit {
  overallScore: number
  summary: string
  scores: AuditScore[]
  bioVariants: string[]
  highlightsStructure: string[]
  pinnedPostIdeas: string[]
  quickWins: string[]
}

const SYSTEM = `Ти — провідний Instagram-маркетолог для health/wellness-спеціалістів в Україні.
Аналізуєш профіль нутриціолога / health-коуча / косметолога і видаєш конкретний аудит з actionable рекомендаціями.

Правила:
- Тільки українська мова
- Без GPT-стилю: жодних "звісно", "безумовно", "підсумовуючи", "важливо зазначити"
- Аудит має показувати реальні проблеми, а не "все добре, але можна покращити"
- Bio max 150 символів, без хештегів, з чітким CTA у кожному варіанті
- Кожен fix — конкретна дія, яку можна зробити сьогодні
- Швидкі дії — те, що займає менше 30 хвилин і дає помітний ефект
- ЗАБОРОНЕНО: "зробіть профіль більш привабливим", "додайте більше цінності", загальні поради без прив'язки до ніші
- Будь лаконічним: summary ≤ 2 речення, issue і fix ≤ 1 речення кожен, quickWins ≤ 1 речення кожен
- Відповідай JSON без markdown-блоків`

export async function generateProfileAudit(profile: Record<string, unknown>): Promise<ProfileAudit> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.bio}

${GOLDEN_EXAMPLES.badOutputPatterns}

Зроби аудит Instagram-профілю. Поверни JSON:
{
  "overallScore": <число 1-100>,
  "summary": "2-3 речення: загальний стан профілю і головна проблема — конкретно, без лестощів",
  "scores": [
    {
      "category": "Bio та перше враження",
      "score": <1-10>,
      "label": "Добре" | "Потребує роботи" | "Критично",
      "issue": "Конкретна проблема — що саме не так",
      "fix": "Конкретне рішення — що саме переписати або змінити"
    },
    { "category": "Позиціонування", "score": ..., "label": ..., "issue": ..., "fix": ... },
    { "category": "Офер і CTA", "score": ..., "label": ..., "issue": ..., "fix": ... },
    { "category": "Цільова аудиторія", "score": ..., "label": ..., "issue": ..., "fix": ... },
    { "category": "Довіра і соціальний доказ", "score": ..., "label": ..., "issue": ..., "fix": ... }
  ],
  "bioVariants": [
    "Bio варіант 1 (≤150 символів, без хештегів, з конкретним CTA)",
    "Bio варіант 2",
    "Bio варіант 3"
  ],
  "highlightsStructure": [
    "Highlights 1: назва → що туди покласти (конкретно)",
    "Highlights 2: ...",
    "Highlights 3: ...",
    "Highlights 4: ...",
    "Highlights 5: ..."
  ],
  "pinnedPostIdeas": [
    "Закріплений пост 1 — тема і формат (чому саме цей пост)",
    "Закріплений пост 2",
    "Закріплений пост 3"
  ],
  "quickWins": [
    "Дія 1 — що зробити сьогодні (конкретний крок)",
    "Дія 2",
    "Дія 3"
  ]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 4000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as ProfileAudit
  } catch (err) {
    console.error('[profile-auditor] JSON parse failed:', err, '\nRaw text (first 300):', text.slice(0, 300))
    return {
      overallScore: 0,
      summary: '',
      scores: [],
      bioVariants: [],
      highlightsStructure: [],
      pinnedPostIdeas: [],
      quickWins: [],
    }
  }
}
