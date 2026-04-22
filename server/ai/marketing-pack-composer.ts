import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface MarketingPackSection {
  title: string
  content: string
}

export interface MarketingPack {
  expertName: string
  niche: string
  positioning: string
  coreBio: string
  coreOffer: string
  leadMagnet: string
  funnelOverview: string
  contentStrategy: string
  weekOneActions: string[]
  sections: MarketingPackSection[]
}

const SYSTEM = `Ти — головний редактор і стратег маркетингового пакету для health/wellness-спеціаліста в Україні.
Збираєш всі згенеровані матеріали в єдиний зв'язний документ — готовий до використання Marketing Pack.

Правила:
- Тільки українська мова
- Все конкретно, зв'язно, без повторів і без канцелярщини
- Кожна секція логічно пов'язана з наступною: профіль → офер → лідмагніт → воронка → контент
- Тиждень 1 — конкретні дії, які можна почати сьогодні
- Відповідай JSON без markdown-блоків`

export async function composeMarketingPack(
  profile: Record<string, unknown>,
  outputs: Record<string, unknown>
): Promise<MarketingPack> {
  const prompt = `Профіль спеціаліста:
${JSON.stringify(profile, null, 2)}

Згенеровані матеріали:
${JSON.stringify(outputs, null, 2)}

Збери фінальний Marketing Pack. Поверни JSON:
{
  "expertName": "Ім'я або псевдонім спеціаліста",
  "niche": "Визначена ніша (1 рядок)",
  "positioning": "Фінальне позиціонування (1-2 речення): для кого, яку проблему, яким методом, який результат",
  "coreBio": "Фінальний Bio для Instagram (≤150 символів, без хештегів, з CTA)",
  "coreOffer": "Головний офер (назва, формат, тривалість, ціна, результат — 3-4 речення)",
  "leadMagnet": "Основний лідмагніт (назва, формат, як отримати — 2-3 речення)",
  "funnelOverview": "Схема воронки (Reels → кодове слово → Direct → follow-up → консультація) — 3-4 речення",
  "contentStrategy": "Контент-стратегія (баланс типів, частота, зв'язок з офером — 3-4 речення)",
  "weekOneActions": [
    "Дія 1 цього тижня (конкретна, з деталями)",
    "Дія 2",
    "Дія 3",
    "Дія 4",
    "Дія 5"
  ],
  "sections": [
    {
      "title": "Профіль і Bio",
      "content": "Зв'язний текст секції — готовий до копіювання та використання"
    },
    {
      "title": "Офер і продуктова лінійка",
      "content": "..."
    },
    {
      "title": "Лідмагніт і воронка",
      "content": "..."
    },
    {
      "title": "Контент-план",
      "content": "..."
    }
  ]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 3000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as MarketingPack
  } catch {
    return {
      expertName: '', niche: '', positioning: '', coreBio: '',
      coreOffer: '', leadMagnet: '', funnelOverview: '', contentStrategy: '',
      weekOneActions: [], sections: [],
    }
  }
}
