import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ProfilePackaging {
  bioVariants: string[]
  highlightsStructure: Array<{ name: string; content: string[] }>
  pinnedPostConcepts: Array<{ title: string; hook: string; format: string; cta: string }>
  usernameIdeas: string[]
  profileNameVariants: string[]
  categoryRecommendation: string
}

const SYSTEM = `Ти — Instagram-стратег та копірайтер для health/wellness-спеціалістів в Україні.
Пакуєш профіль повністю: Bio, Highlights, закріплені пости, username та назва профілю.

Правила:
- Тільки українська мова
- Bio — ≤150 символів, без хештегів, з чітким CTA (не "підписуйтесь", а конкретна дія)
- Без GPT-стилю та канцелярщини
- Кожен Highlights має очевидну назву і конкретний зміст
- Закріплені пости: 3 пости, що відповідають на "хто ти", "що ти продаєш", "як тобі можна довіряти"
- username — короткий, без зайвих цифр, читабельний
- ЗАБОРОНЕНО у Bio: "нутриціолог | допомагаю бути здоровими | поради • мотивація • рецепти"
- ЗАБОРОНЕНО CTA: "пишіть в Direct, якщо вам відгукується"
- Відповідай JSON без markdown-блоків`

export async function generateProfilePackaging(profile: Record<string, unknown>): Promise<ProfilePackaging> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.bio}

${GOLDEN_EXAMPLES.badOutputPatterns}

Запакуй профіль. Поверни JSON:
{
  "bioVariants": [
    "Bio варіант 1 (≤150 символів, без хештегів, з конкретним CTA)",
    "Bio варіант 2",
    "Bio варіант 3"
  ],
  "highlightsStructure": [
    {
      "name": "Назва Highlights (коротка, зрозуміла)",
      "content": ["Що туди покласти — 3-5 конкретних пунктів"]
    }
  ],
  "pinnedPostConcepts": [
    {
      "title": "Тема закріпленого поста",
      "hook": "Перше речення, що зупиняє і змушує читати далі",
      "format": "Карусель | Рілс | Фото",
      "cta": "Конкретний заклик до дії наприкінці"
    }
  ],
  "usernameIdeas": ["username_1", "username_2", "username_3"],
  "profileNameVariants": [
    "Ім'я Прізвище | Нутриціолог",
    "Варіант 2 з уточненням ніші"
  ],
  "categoryRecommendation": "Яку категорію бізнесу встановити в Instagram і чому (конкретна назва категорії)"
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 2500,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as ProfilePackaging
  } catch {
    return {
      bioVariants: [],
      highlightsStructure: [],
      pinnedPostConcepts: [],
      usernameIdeas: [],
      profileNameVariants: [],
      categoryRecommendation: '',
    }
  }
}
