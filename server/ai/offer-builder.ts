import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext, GOLDEN_EXAMPLES } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface OfferItem {
  name: string
  description: string
  price: string
  format: string
  audience: string
  usp: string
}

export interface OfferResult {
  coreOffer: OfferItem
  upsell: OfferItem
  downsell: OfferItem
  launchSequence: string[]
  pricingRationale: string
  salesPageHook: string
}

const SYSTEM = `Ти — продуктовий стратег для health/wellness-спеціалістів в Україні.
Будуєш продуктову лінійку та офер-стратегію на основі даних онбордингу.

Правила:
- Тільки українська мова
- Без GPT-стилю та канцелярщини
- Кожен офер має: для кого, яку проблему вирішує, яким форматом, за який час, який конкретний результат
- Конкретні ціни в гривнях (UAH), орієнтуйся на ринок health/wellness-спеціалістів в Україні
- Core offer — головний продукт, який приносить основний дохід (зазвичай 4-6 тижневий супровід)
- Upsell — розширена або довша версія для тих, хто готовий більше інвестувати
- Downsell — точковий продукт для тих, хто не готовий до повного супроводу (консультація, гайд, чекліст)
- salesPageHook — короткий, конкретний, стимулює бажання дізнатись більше
- ЗАБОРОНЕНО: "трансформація", "комплексний підхід", "індивідуальна програма для досягнення цілей"
- Відповідай JSON без markdown-блоків`

export async function generateOffer(profile: Record<string, unknown>): Promise<OfferResult> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

${GOLDEN_EXAMPLES.offer}

${GOLDEN_EXAMPLES.badOutputPatterns}

Побудуй продуктову лінійку. Поверни JSON:
{
  "coreOffer": {
    "name": "Назва core-офера (конкретна, без канцеляриту)",
    "description": "2-3 речення: що отримає клієнт, за який час, яким форматом — без розмитих слів",
    "price": "Рекомендована ціна в UAH",
    "format": "Формат (індивідуально онлайн / група / курс / etc.)",
    "audience": "Для кого конкретно: хто ця людина, яка у неї проблема",
    "usp": "Унікальна перевага — чому саме цей спеціаліст і цей підхід"
  },
  "upsell": {
    "name": "...",
    "description": "...",
    "price": "...",
    "format": "...",
    "audience": "...",
    "usp": "..."
  },
  "downsell": {
    "name": "...",
    "description": "...",
    "price": "...",
    "format": "...",
    "audience": "...",
    "usp": "..."
  },
  "launchSequence": [
    "Крок 1: що запустити першим і чому (логіка послідовності)",
    "Крок 2",
    "Крок 3"
  ],
  "pricingRationale": "2 речення: логіка ціноутворення відносно ринку та цінності для клієнта",
  "salesPageHook": "Заголовок для сторінки / Stories — конкретний, з болем або результатом"
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1500,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  try {
    return JSON.parse(text) as OfferResult
  } catch {
    return {
      coreOffer: { name: '', description: '', price: '', format: '', audience: '', usp: '' },
      upsell: { name: '', description: '', price: '', format: '', audience: '', usp: '' },
      downsell: { name: '', description: '', price: '', format: '', audience: '', usp: '' },
      launchSequence: [],
      pricingRationale: '',
      salesPageHook: '',
    }
  }
}
