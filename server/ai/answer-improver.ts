import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface ImproveResult {
  quality: 'good' | 'needs_work' | 'too_vague'
  feedback: string
  suggestion: string
}

const SYSTEM = `Ти — асистент перевірки відповідей у маркетинговій системі для health/wellness-спеціалістів.
Оцінюєш відповідь користувача на онбординг-питання і даєш коротку конкретну зворотній зв'язок.

Правила:
- Тільки українська мова
- Конкретно, без води і без GPT-канцеляриту
- Якщо відповідь хороша — скажи коротко чому і не вигадуй зауважень
- Якщо відповідь розмита — поясни КОНКРЕТНО чого не вистачає
- Дай приклад-підказку як можна відповісти краще
- ЗАБОРОНЕНО писати: "Ваша відповідь варта уваги", "Чудово, що ви...", "Дякую за відповідь"
- Відповідай JSON без markdown-блоків`

export async function improveAnswer(question: string, answer: string): Promise<ImproveResult> {
  const prompt = `Питання: ${question}

Відповідь користувача: ${answer}

Оціни якість відповіді. Поверни JSON:
{
  "quality": "good" | "needs_work" | "too_vague",
  "feedback": "1-2 речення — що конкретно не так або чому добре",
  "suggestion": "Конкретний приклад як можна відповісти краще (якщо quality не 'good')"
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 512,
    system: SYSTEM,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  try {
    return JSON.parse(text) as ImproveResult
  } catch {
    return { quality: 'good', feedback: '', suggestion: '' }
  }
}
