import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type ContentType = 'expert' | 'engaging' | 'selling' | 'pain' | 'objection'

export interface ReelsScript {
  title: string
  contentType: ContentType
  relatedOffer: string
  leadMagnetLink: string
  painItCloses: string
  hook: string
  mainIdea: string
  scenes: string[]
  cta: string
  caption: string
  goal: string
  format: string
}

export interface ContentConnectionMap {
  reelsTitle: string
  leadMagnet: string
  directCta: string
}

export interface ContentPack {
  scripts: ReelsScript[]
  connectionMap: ContentConnectionMap[]
  contentCalendar: string
  hashtagSets: Array<{ theme: string; tags: string[] }>
}

const SYSTEM = `Ти — контент-стратег і Reels-сценарист для health/wellness-спеціалістів в Україні.
Пишеш сценарії, де кожен Reels є частиною воронки: охоплення → довіра → Direct → консультація.

Правила:
- Тільки українська мова
- Hook — перші 3 секунди, зупиняє скрол: провокація, несподіване твердження або болюче питання
- Scenes — 4-6 конкретних кадрів або фраз, без "Вступ" / "Підсумок" / "Перший пункт"
- CTA — конкретний, з прив'язкою до лід-магніту або кодового слова
- Caption — 2-4 речення, підсилюють основне повідомлення і мотивують до дії
- Баланс: 3-4 "expert/pain/engaging" і 1-2 "selling/objection" у паку
- Кожен Reels закриває конкретний біль і веде до конкретного наступного кроку
- ЗАБОРОНЕНО хуки: "Сьогодні поговоримо про...", "Хочу поділитися важливим...", "Привіт, друзі!"
- ЗАБОРОНЕНО: Reels без прив'язки до офера або лід-магніту, загальні поради без воронки
- Відповідай JSON без markdown-блоків`

export async function generateContentPack(profile: Record<string, unknown>): Promise<ContentPack> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.reelsScript}

${GOLDEN_EXAMPLES.badOutputPatterns}

Створи 10 Reels-сценаріїв і карту зв'язку "контент → лід-магніт → CTA". Поверни JSON:
{
  "scripts": [
    {
      "title": "Назва сценарію",
      "contentType": "expert|engaging|selling|pain|objection",
      "relatedOffer": "Назва офера, до якого веде цей Reels",
      "leadMagnetLink": "Назва лід-магніту в CTA (коротко)",
      "painItCloses": "Яку біль закриває (фразою аудиторії, ≤15 слів)",
      "hook": "Перші 3 секунди — провокація або питання, що зупиняє скрол",
      "mainIdea": "Основна теза (1 речення)",
      "scenes": ["Кадр 1", "Кадр 2", "Кадр 3", "Кадр 4", "Кадр 5"],
      "cta": "Конкретний заклик до дії з кодовим словом або Direct",
      "caption": "2-4 речення під пост",
      "goal": "охоплення|довіра|Direct|продаж",
      "format": "Говорюча голова|Туторіал|До-після|Список|Провокація|Порівняння"
    }
  ],
  "connectionMap": [
    {
      "reelsTitle": "Назва Reels",
      "leadMagnet": "Який лід-магніт отримує людина після перегляду",
      "directCta": "Що відбувається в Direct після отримання лід-магніту"
    }
  ],
  "contentCalendar": "Рекомендація: послідовність запуску (що перше, що потім і чому) — 3-4 речення",
  "hashtagSets": [
    { "theme": "Тема 1", "tags": ["#хештег1", "#хештег2", "#хештег3"] },
    { "theme": "Тема 2", "tags": ["#хештег1", "#хештег2", "#хештег3"] },
    { "theme": "Тема 3", "tags": ["#хештег1", "#хештег2", "#хештег3"] }
  ]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 8000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as ContentPack
  } catch (err) {
    console.error('[content-engine] JSON parse failed:', err, '\nRaw (first 300):', text.slice(0, 300))
    return { scripts: [], connectionMap: [], contentCalendar: '', hashtagSets: [] }
  }
}
