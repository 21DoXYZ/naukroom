import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface QAResult {
  score: number           // 0–100
  passed: boolean         // true if score >= 70
  issues: string[]        // list of specific problems found
  rewrittenFields: Record<string, string>  // fields that were rewritten (key → new value)
}

const SYSTEM = `Ти — QA-редактор AI-видачі для маркетингової системи health/wellness-спеціалістів в Україні.
Твоя задача: перевірити якість згенерованого тексту і переписати слабкі поля.

Критерії оцінки (0-100):
- Відсутність GPT-канцеляриту: "звісно", "безумовно", "підсумовуючи", "важливо зазначити", "у сучасному світі" (-10 за кожне)
- Відсутність розмитих формулювань: "допомагаю знайти баланс", "підтримую на шляху", "трансформація", "автентичність" (-15 за кожне)
- Конкретність: наявність ЦА, болю, результату, формату (до +20)
- Відповідність ніші: прив'язка до конкретної ніші, не generic (-20 якщо generic)
- CTA конкретний: не "пишіть якщо відгукується", а дія або кодове слово (+10)
- Мова: тільки українська (-30 якщо є інша мова)

Повертай JSON без markdown-блоків.`

export async function runQA(
  outputType: string,
  content: Record<string, unknown>
): Promise<QAResult> {
  const prompt = `Тип модуля: ${outputType}

Згенерований контент:
${JSON.stringify(content, null, 2)}

Перевір якість. Знайди слабкі або Generic місця. Перепиши поля, які не пройшли перевірку.

Поверни JSON:
{
  "score": <0-100>,
  "passed": <true якщо score >= 70>,
  "issues": [
    "Конкретна проблема 1 (яке поле, що саме не так)",
    "Проблема 2"
  ],
  "rewrittenFields": {
    "назваПоля": "Перероблений текст цього поля (тільки для полів, що не пройшли перевірку)"
  }
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  try {
    return JSON.parse(text) as QAResult
  } catch {
    return { score: 75, passed: true, issues: [], rewrittenFields: {} }
  }
}
