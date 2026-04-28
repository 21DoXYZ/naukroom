import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'
import { cleanBio } from './utils.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface PositioningSummary {
  whoYouAre: string
  coreOffer: string
  targetClient: string
  mainPain: string
  draftBio: string
  topProfileIssue: string
  nextSteps: string[]
}

const SYSTEM = `Ти — стратег з позиціонування для health/wellness-спеціалістів в Україні.
На основі даних з онбордингу формуєш чітке і конкретне позиціонування.

Правила:
- Тільки українська мова
- Жодного GPT-стилю: ніяких "звісно", "безумовно", "підсумовуючи", "насамперед варто зазначити"
- Все конкретно і застосовно одразу — формулюй як маркетолог-практик, не як ChatGPT
- Bio СТРОГО ≤150 символів (Instagram-ліміт). Порахуй перед видачею. Краще 120-140 символів ніж 151.
- Поле "Ім'я" профілю СТРОГО ≤30 символів
- Позиціонування має включати: для кого, яку проблему, яким методом, який результат
- ЗАБОРОНЕНО: "допомагаю знайти баланс", "підтримую на шляху", "трансформація", "автентичність", "проявити себе"
- Відповідай JSON без markdown-блоків`

export async function generatePositioningSummary(profile: Record<string, unknown>): Promise<PositioningSummary> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.positioning}

${GOLDEN_EXAMPLES.bio}

${GOLDEN_EXAMPLES.badOutputPatterns}

Сформуй позиціонування. Поверни JSON:
{
  "whoYouAre": "1 речення: хто цей спеціаліст і чим займається (конкретно, без канцеляриту)",
  "coreOffer": "Головне що він продає / має продавати (з форматом і результатом)",
  "targetClient": "Для кого конкретно — вік, ситуація, основна проблема",
  "mainPain": "Головний біль аудиторії — конкретна фраза, якою людина сама описує свою проблему",
  "draftBio": "Готовий варіант Bio (≤150 символів, без хештегів, з CTA)",
  "topProfileIssue": "Одна головна проблема поточного профілю або позиціонування",
  "nextSteps": ["3 конкретні наступні кроки для цього спеціаліста"]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    const result = JSON.parse(text) as PositioningSummary
    if (result.draftBio) result.draftBio = cleanBio(result.draftBio)
    return result
  } catch {
    return {
      whoYouAre: '',
      coreOffer: '',
      targetClient: '',
      mainPain: '',
      draftBio: '',
      topProfileIssue: '',
      nextSteps: [],
    }
  }
}
