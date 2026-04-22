import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface LeadMagnetConcept {
  title: string
  format: string
  painItSolves: string
  deliverable: string
  distributionMethod: string
  cta: string
}

export interface LeadMagnetResult {
  concepts: LeadMagnetConcept[]
  recommendedFirst: number
  distributionStrategy: string
  followUpSequence: string[]
}

const SYSTEM = `Ти — контент-стратег та маркетолог для health/wellness-спеціалістів в Україні.
Розробляєш лід-магніти, що конвертують підписників у ліди та ведуть до консультації.

Правила:
- Тільки українська мова
- Лід-магніт вирішує одну конкретну біль аудиторії — не "все про харчування", а "чому ви переїдаєте ввечері"
- Лід-магніт має бути пов'язаний з основним офером: після нього людина розуміє, що потрібен супровід
- Без GPT-стилю та канцелярщини
- CTA — конкретний, з кодовим словом або прямою дією в Direct
- followUpSequence — живі людяні повідомлення, без "Дякуємо за інтерес до нашого продукту"
- ЗАБОРОНЕНО: лід-магніти без прив'язки до болю, занадто широкі теми, загальні поради
- Відповідай JSON без markdown-блоків`

export async function generateLeadMagnets(profile: Record<string, unknown>): Promise<LeadMagnetResult> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.leadMagnet}

${GOLDEN_EXAMPLES.badOutputPatterns}

Розроби 3 лід-магніти. Поверни JSON:
{
  "concepts": [
    {
      "title": "Назва лід-магніту (конкретна, з болем або результатом)",
      "format": "PDF-гайд | Чекліст | Міні-курс | Відео | Шаблон | Тест",
      "painItSolves": "Яку конкретну біль аудиторії вирішує (фразою самої аудиторії)",
      "deliverable": "Що конкретно отримає людина (3-5 пунктів через кому)",
      "distributionMethod": "Де і як давати: Stories з кодовим словом | Direct | Linktree | Bio-лінк",
      "cta": "Готовий заклик для Stories або поста (з кодовим словом або конкретною дією)"
    }
  ],
  "recommendedFirst": 0,
  "distributionStrategy": "2 речення: як запустити перший лід-магніт, звідки брати трафік і куди вести далі",
  "followUpSequence": [
    "Повідомлення 1 одразу після отримання (живе, людяне, без канцелярщини)",
    "Повідомлення 2 через 24 години (запитання або корисна думка)",
    "Повідомлення 3 через 3 дні (м'який перехід до консультації)"
  ]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 3500,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as LeadMagnetResult
  } catch (err) {
    console.error('[lead-magnet] JSON parse failed:', err, '\nRaw (first 300):', text.slice(0, 300))
    return { concepts: [], recommendedFirst: 0, distributionStrategy: '', followUpSequence: [] }
  }
}
