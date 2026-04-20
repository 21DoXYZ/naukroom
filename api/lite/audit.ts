import Anthropic from '@anthropic-ai/sdk'

interface Req {
  method: string
  body: {
    profession?: string
    bio?: string
    offerType?: string
    clientTransformation?: string
    instagramUrl?: string
  }
}

interface ResHelper {
  status(code: number): ResHelper
  json(data: unknown): void
  setHeader(name: string, value: string): void
}

const SYSTEM = `Ти — провідний Instagram-маркетолог для health/wellness-спеціалістів України з 8+ роками практики. Ти дивишся на профіль очима холодного відвідувача — людини, яка бачить акаунт уперше.

Твій фреймворк оцінки: профіль продає тільки тоді, коли холодний відвідувач за 8 секунд отримує відповіді на 3 питання:
1. «Це для мене?» — чи є чітка вузька ніша і конкретний аватар клієнта
2. «Вони мені допоможуть?» — чи є конкретний результат і хоч один доказ
3. «Що робити далі?» — чи є один чіткий наступний крок

Критерії оцінки по категоріях (1–10):

НІША І АУДИТОРІЯ («Це для мене?»):
8–10 = конкретний аватар із ситуацією («жінки 28–42 з гормональним дисбалансом після пологів»)
5–7 = є ніша, але розмита («хочу допомогти всім, хто хоче схуднути»)
1–4 = немає аватара, звернення до «всіх» або просто назва професії

РЕЗУЛЬТАТ І ЦІННІСТЬ («Вони мені допоможуть?» — частина 1):
8–10 = конкретна трансформація з деталями («мінус 8–12 кг за 3 місяці без відмови від улюбленої їжі»)
5–7 = є обіцянка результату, але загальна («допоможу схуднути і почуватися краще»)
1–4 = тільки опис себе без результату («нутриціолог | 5 років досвіду | онлайн»)

ДОВІРА І ДОКАЗ («Вони мені допоможуть?» — частина 2):
8–10 = конкретні докази: кількість клієнтів, % з результатом, назва методу, кейс
5–7 = згадка про досвід або сертифікацію без конкретики
1–4 = ніяких доказів, чисте «я нутриціолог — пишіть мені»

ЗАКЛИК ДО ДІЇ («Що робити далі?»):
8–10 = один конкретний CTA із вигодою («→ DM «старт» — безкоштовний аудит харчування»)
5–7 = є CTA, але розмитий («пишіть в директ», «посилання в bio»)
1–4 = немає CTA або їх декілька (увага розсіюється)

ДИФЕРЕНЦІАЦІЯ (чому ти, а не 50 інших):
8–10 = унікальний метод, кут зору або специфіка, якої немає в конкурентів
5–7 = є особливість, але важко відрізнити від конкурентів
1–4 = стандартний профіль без жодного відмінного елемента

Правила відповіді:
— Тільки українська мова
— Заборонені фрази: «звісно», «безумовно», «важливо зазначити», «підсумовуючи», «зробіть профіль більш привабливим», «додайте цінності»
— issue = конкретна цитата з bio або опис відсутнього елемента + чому це проблема для продажів
— fix = конкретна фраза, яку можна вставити в bio сьогодні, з поясненням логіки
— Bio варіанти: кожен реалізує різну стратегію, max 150 символів, без хештегів
— Відповідай виключно JSON без markdown-блоків і без коментарів`

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

  const { profession, bio, offerType, clientTransformation, instagramUrl } = req.body

  if (!profession || !bio) {
    res.status(400).json({ error: 'profession and bio are required' })
    return
  }

  const contextLines: string[] = []
  if (offerType) contextLines.push(`Що продає: ${offerType}`)
  if (clientTransformation) contextLines.push(`Результат клієнта: ${clientTransformation}`)
  if (instagramUrl) contextLines.push(`Instagram: ${instagramUrl}`)
  const context = contextLines.length > 0 ? '\n' + contextLines.join('\n') : ''

  const prompt = `Аналізуй Instagram-профіль health/wellness-спеціаліста.

--- ДАНІ ---
Спеціалізація: ${profession}
Поточне Bio:
"${bio}"${context}

--- ЗАВДАННЯ ---
Перевір bio на 3 ключових питання холодного відвідувача:
1. «Це для мене?» — чи видно конкретного клієнта і його ситуацію
2. «Вони мені допоможуть?» — чи є конкретний результат і хоч один доказ
3. «Що робити далі?» — чи є один чіткий наступний крок

Поверни JSON:
{
  "overallScore": <1–100, зважена середня: ніша 25% + результат 25% + довіра 20% + CTA 20% + диф 10%>,
  "verdict": "<одне речення — головна проблема профілю, яка блокує продажі, конкретно>",
  "summary": "<2–3 речення: що конкретно не так і чому це не конвертує холодного відвідувача>",
  "scores": [
    {
      "category": "Ніша і аудиторія",
      "score": <1–10>,
      "label": <"Добре" якщо score>=7, "Потребує роботи" якщо 4–6, "Критично" якщо <=3>,
      "issue": "<конкретна цитата з bio або опис що відсутнє + чому це проблема>",
      "fix": "<конкретна фраза для bio + пояснення логіки>"
    },
    { "category": "Результат і цінність", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Довіра і доказ", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Заклик до дії", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Диференціація", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." }
  ],
  "bioVariants": [
    {
      "strategy": "Від болю аудиторії",
      "text": "<Bio починається з болю або ситуації клієнта, max 150 символів, без хештегів>"
    },
    {
      "strategy": "Від результату",
      "text": "<Bio починається з конкретного результату клієнта, max 150 символів>"
    },
    {
      "strategy": "Метод і диференціатор",
      "text": "<Bio розкриває унікальний підхід або кут зору спеціаліста, max 150 символів>"
    }
  ],
  "highlightsStructure": [
    "<Highlights 1: [назва] — [конкретний контент, не загальний опис]>",
    "<Highlights 2: ...>",
    "<Highlights 3: ...>",
    "<Highlights 4: ...>",
    "<Highlights 5: ...>"
  ],
  "pinnedPostIdeas": [
    "<Тема + формат + чому цей пост конвертує для даної ніші>",
    "<...>",
    "<...>"
  ],
  "quickWins": [
    "<Конкретна дія сьогодні + очікуваний ефект + оцінка часу>",
    "<...>",
    "<...>"
  ]
}`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[lite/audit]', detail)
    res.status(500).json({ error: 'Generation failed', detail })
  }
}
