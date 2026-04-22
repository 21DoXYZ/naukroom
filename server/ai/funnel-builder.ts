import Anthropic from '@anthropic-ai/sdk'
import { buildNicheContext } from './niche-context.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface FunnelStage {
  stage: string
  goal: string
  content: string
  timing: string
  template: string
}

export interface FunnelResult {
  // Contract fields (11_OUTPUT_CONTRACTS.md)
  goal: string
  trigger_content: string
  code_word: string
  first_dm: string
  follow_up_1: string
  follow_up_2: string
  handoff_to_expert: string
  conversion_target: string
  // Rich structured fields
  funnelName: string
  overview: string
  codeWord: string
  stages: FunnelStage[]
  reelHooks: string[]
  directScript: string
  followUp1: string
  followUp2: string
  liveExpertCondition: string
  objectionHandling: string[]
}

const SYSTEM = `Ти — воронковий стратег для health/wellness-спеціалістів в Україні.
Будуєш пряму просту воронку: Reels → кодове слово → Direct → follow-up → консультація.

Правила:
- Тільки українська мова
- Кодове слово — 1-2 слова, просте, пов'язане з лід-магнітом або болем (не "Старт", "Хочу", а конкретне)
- Шаблони повідомлень — живі, людяні, без "Дякуємо за ваш інтерес"
- Direct-скрипт: не продає відразу, спочатку дає лід-магніт, потім нативно запитує про ситуацію
- Follow-up 1: легке нагадування + цінність, без тиску
- Follow-up 2: м'який CTA на консультацію з конкретною пропозицією
- Reels hooks: перші 3 секунди, що зупиняють скрол і мотивують написати кодове слово
- liveExpertCondition: конкретні сигнали (що написала людина в Direct), що означають готовність купити
- ЗАБОРОНЕНО: автоматизовані воронки без людського контакту, агресивний сейлз-скрипт
- Відповідай JSON без markdown-блоків`

export async function generateFunnel(profile: Record<string, unknown>): Promise<FunnelResult> {
  const nicheCtx = buildNicheContext(profile)

  const prompt = `Дані спеціаліста з онбордингу:
${JSON.stringify(profile, null, 2)}
${nicheCtx}

Побудуй воронку з кодовим словом. Поверни JSON (всі поля обов'язкові):
{
  "goal": "Мета воронки: від якого контенту до якого результату (1 речення)",
  "trigger_content": "Опис Reels або поста, що запускає воронку (тема + хук)",
  "code_word": "Кодове слово (1-2 слова)",
  "first_dm": "Перше повідомлення в Direct після кодового слова (повний текст)",
  "follow_up_1": "Follow-up через 24-48 год (повний текст)",
  "follow_up_2": "Follow-up з CTA через 3-4 дні (повний текст)",
  "handoff_to_expert": "Конкретні сигнали готовності купити — коли підключається живий спеціаліст",
  "conversion_target": "На що конвертуємо: назва і ціна послуги",
  "funnelName": "Назва воронки (пов'язана з лід-магнітом і нішею)",
  "overview": "2 речення: як ця конкретна воронка працює для цього спеціаліста",
  "codeWord": "Конкретне кодове слово для коментаря (1-2 слова)",
  "stages": [
    {
      "stage": "Reels / Охоплення",
      "goal": "Мета: зупинити потрібну людину і спровокувати написати кодове слово",
      "content": "Що показувати: тема і формат Reels",
      "timing": "Коли і як часто публікувати",
      "template": "Готовий хук або CTA фінальний для Reels із закликом написати кодове слово"
    },
    {
      "stage": "Кодове слово / Перший контакт",
      "goal": "Мета: захопити контакт і видати лід-магніт",
      "content": "Що відбувається після того, як людина написала кодове слово",
      "timing": "Одразу після коментаря або Direct",
      "template": "Перше авто-повідомлення або шаблон для ручної відповіді"
    },
    {
      "stage": "Direct / Прогрів",
      "goal": "Мета: зрозуміти ситуацію людини і збудувати контакт",
      "content": "Що питати і як вести розмову після отримання лід-магніту",
      "timing": "Через 10-30 хвилин після видачі лід-магніту",
      "template": "Скрипт продовження розмови (нативне запитання про ситуацію)"
    },
    {
      "stage": "Follow-up 1",
      "goal": "Мета: нагадати про себе і дати цінність",
      "content": "Що написати — цінна думка або питання",
      "timing": "Через 24-48 годин",
      "template": "Готове повідомлення для першого follow-up (без тиску)"
    },
    {
      "stage": "Follow-up 2 / CTA",
      "goal": "Мета: м'яко запросити на консультацію",
      "content": "Конкретна пропозиція консультації або діагностики",
      "timing": "Через 3-4 дні",
      "template": "Готове повідомлення з CTA на безкоштовну консультацію або перший крок"
    }
  ],
  "reelHooks": [
    "Хук 1 — із закликом написати кодове слово (конкретний біль або обіцянка результату)",
    "Хук 2",
    "Хук 3",
    "Хук 4",
    "Хук 5"
  ],
  "directScript": "Готовий скрипт першого повідомлення після отримання лід-магніту (3-4 речення, живе, без тиску)",
  "followUp1": "Повний текст follow-up 1 (через 24-48 годин, з цінністю і без продажу)",
  "followUp2": "Повний текст follow-up 2 з м'яким CTA (через 3-4 дні)",
  "liveExpertCondition": "Конкретні сигнали в листуванні, що означають: людина готова купити — підключай живого спеціаліста",
  "objectionHandling": [
    "Заперечення 1 → Конкретна відповідь",
    "Заперечення 2 → Конкретна відповідь",
    "Заперечення 3 → Конкретна відповідь"
  ]
}`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 6000,
    system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim()
  try {
    return JSON.parse(text) as FunnelResult
  } catch (err) {
    console.error('[funnel-builder] JSON parse failed:', err, '\nRaw (first 300):', text.slice(0, 300))
    return {
      goal: '', trigger_content: '', code_word: '', first_dm: '',
      follow_up_1: '', follow_up_2: '', handoff_to_expert: '', conversion_target: '',
      funnelName: '', overview: '', codeWord: '', stages: [],
      reelHooks: [], directScript: '', followUp1: '', followUp2: '',
      liveExpertCondition: '', objectionHandling: [],
    }
  }
}
