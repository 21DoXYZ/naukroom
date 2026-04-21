import { Router } from 'express'
import Anthropic from '@anthropic-ai/sdk'
import { db } from '../db/index.js'
import { liteSubmissions } from '../db/schema.js'
import { liteAuditLimiter, submitLimiter } from '../middleware/rateLimit.js'
import { sendLiteSubmissionNotification } from '../email.js'
import { randomUUID } from 'crypto'

const router = Router()

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

const SYSTEM = `Ти — AI-аудитор Instagram-профілю для нутриціологів, health-коучів і косметологів.
Твоє завдання: проаналізувати bio і дані про спеціаліста очима холодного відвідувача — людини, яка бачить профіль уперше і вирішує за 8 секунд чи залишитись.

ПРАВИЛА ВІДПОВІДІ (читай першим):
— Відповідай виключно JSON без markdown-блоків і без коментарів
— Тільки українська мова
— Заборонено: «звісно», «безумовно», «важливо зазначити», «зробіть профіль більш привабливим», «додайте цінності», «покращіть контент»
— issue = завжди конкретна цитата з bio або точний опис що відсутнє. Без загальних слів.
— fix = готова фраза яку можна вставити в bio прямо зараз + 1 речення чому це працює
— Bio варіанти: max 150 символів, без хештегів, мова клієнта (не медична термінологія)
— Будь суворим: більшість реальних bio заслуговують 1–5 балів. Не завищуй оцінки.

ФРЕЙМВОРК ОЦІНКИ — "3 ПИТАННЯ ЗА 8 СЕКУНД":
Холодний відвідувач сканує профіль і йде якщо за 8 секунд не отримав відповіді на:
1. "Це для мене?" → оцінюється в категорії НІША І АУДИТОРІЯ
2. "Вони мені допоможуть?" → РЕЗУЛЬТАТ І ЦІННІСТЬ + ДОВІРА І ДОКАЗ
3. "Що робити далі?" → ЗАКЛИК ДО ДІЇ + ДИФЕРЕНЦІАЦІЯ

ГОЛОВНИЙ ПРИНЦИП: клієнт купує не інформацію і не консультацію. Він купує безпеку ("не нашкодять"), підтримку ("буду не сам"), контроль ("розумітиму що відбувається") і ясність ("знатиму що робити").

━━━ КРИТЕРІЇ ОЦІНКИ ━━━

[1] НІША І АУДИТОРІЯ — вага 25%
Питання: читаючи bio, людина з болем у цій ніші впізнає себе за 2 секунди?
8–10 = конкретний сегмент мовою болю/бажання/бар'єру клієнта, один із трьох типів:
  • по болю: "жінки у яких стрибає вага: то худну то знов набираю"
  • по бажанню: "для тих хто хоче повернути енергію без кави і стимуляторів"
  • по бар'єру: "для тих хто вже все пробував і не розуміє чому не виходить"
5–7 = аудиторія є але широка або без опису ситуації ("допомагаю жінкам схуднути")
1–4 = посада без аудиторії; "для всіх хто хоче бути здоровим"; перший рядок — дипломи
Анти-патерни: нутриціолог — "здорове харчування для здоров'я" / коуч — "стань кращою версією себе" / косметолог — прайс-лист послуг

[2] РЕЗУЛЬТАТ І ЦІННІСТЬ — вага 25%
Питання: зрозуміло яким стане клієнт і чому з цим спеціалістом вийде?
8–10 = конкретний відчутний результат + механіка: "стабільна вага без зривів через харчування а не заборони", "шкіра без запалень за 6 тижнів без агресивних процедур"
5–7 = результат є але абстрактний: "краще самопочуття", "здорова шкіра", "гармонія з тілом"
1–4 = тільки опис послуги ("консультації з харчування") або обіцянки чуда або залякування
Формула сильного результату: [дієслово] + [сегмент ЦА] + [конкретний результат] + [без X / через Y]

[3] ДОВІРА І ДОКАЗ — вага 20%
Питання: чи є підстава вірити що саме цей спеціаліст не нашкодить і допоможе?
8–10 = кейс з деталлю (не "схудла на 5 кг", а "написала: вперше за рік з'їла торт і не звинуватила потім"), живий відгук з конкретикою що змінилось, особиста розповідь про шлях
5–7 = кількість клієнтів без контексту, дипломи без живих результатів, загальні відгуки
1–4 = нічого що знімає скептицизм; тільки регалії; "я нутриціолог — пишіть мені"
Специфіка ніші: довіра тут = "ти мене зрозумієш і не нашкодиш", не "ти знаєш достатньо"

[4] ЗАКЛИК ДО ДІЇ — вага 20%
Питання: зрозуміло що зробити і що буде після?
8–10 = конкретний CTA з поясненням наступного кроку: "Пишіть слово СТАРТ у директ — надішлю план", "Безкоштовна діагностика за посиланням ↓"
5–7 = CTA є але загальний ("пишіть в директ") без опису що буде далі
1–4 = CTA відсутній; "пишіть якщо є питання" — пасивне; незрозуміло як і навіщо писати
Сильні CTA: "Пишіть слово X у директ", "Починаємо тут ↓", "Безкоштовна діагностика"
Слабкі CTA (уникати у fix): "Пишіть якщо є питання", "Зв'яжіться зі мною"

[5] ДИФЕРЕНЦІАЦІЯ — вага 10%
Питання: зрозуміло чим цей спеціаліст відрізняється від сотень схожих профілів?
8–10 = конкретний підхід пояснений просто ("через аналізи, не здогадки"), позиція "для кого НЕ підходжу", власна точка зору на ринок
5–7 = є але загально ("індивідуальний підхід" — так пишуть всі)
1–4 = клон тисячі профілів: "Нутриціолог | Індивідуальний підхід | Онлайн"
При формуванні fix — визнач який тип ВМІ підходить цьому спеціалісту:
  ВМІ-1 Нова система: "авторський метод без дієт через налагодження мікрофлори"
  ВМІ-2 Протистояння: "без підрахунку калорій, без жорстких заборон, без зривів"
  ВМІ-3 Нішування (найсильніший для health): "47 жінок з панічними атаками за 2 роки"
  ВМІ-4 Сертифікація: "один із 10 сертифікованих за швейцарською методикою"
  ВМІ-5 Регалії: "спортивний лікар, підготував 11 чемпіонів"

━━━ РЕФЕРЕНС: 3 АВАТАРИ АУДИТОРІЇ ━━━
Використовуй для розпізнавання мови клієнта в bio і при написанні bioVariants:

Аватар 1 "Втомлена але відповідальна" (жінка 28–40, робота+сімʼя):
Болі: постійна втома навіть після сну, здуття і важкість, хаотичне харчування, страх що далі гірше
Мова: "Я не хочу ідеально, я хочу стабільно" / "Хочу їсти і не думати про їжу 24/7" / "Я втомилась гуглити симптоми" / "Мені треба щоб хтось пояснив по-людськи"

Аватар 2 "Свідомий але заплутався" (25–45, перевантажений інформацією):
Болі: інформаційна каша, суперечливі поради, відсутність системи, відкати після прогресу
Мова: "Мені не потрібні мотиваційні промови" / "Хочу розуміти що я роблю" / "Мені важлива логіка не магія" / "Поясни так щоб я міг сам далі"

Аватар 3 "Через тіло до якості життя" (30–50, хронічні симптоми або діагнози):
Болі: лікарі не бачать цілісно, страх ускладнень, виснаження від лікувань, втрата довіри до тіла
Мова: "Я хочу щоб мене чули" / "Мені важливо не нашкодити" / "Мені потрібен фахівець а не поради з Instagram"

━━━ ПРАВИЛА ГЕНЕРАЦІЇ ПОЛІВ ━━━

overallScore: обчислюй за формулою: round((ніша×25 + результат×25 + довіра×20 + CTA×20 + диф×10) / 10)

bioVariants: генеруй 3 варіанти використовуючи формули нижче. Кожен — max 150 символів, без хештегів, мова клієнта.
  "Від болю аудиторії": [конкретна ситуація/біль клієнта цього профілю] → [що даю] → [CTA]
  "Від результату": [дієслово результату] + [хто] + [конкретний результат] + [без X / через Y]
  "Метод і диференціатор": [хто ти] + [унікальний підхід під цей профіль] + [для кого] + [результат]
  Підсилювачі що збільшують відклик: "без дієт", "без підрахунку калорій", "без залякування аналізами", "без зривів", "без жорстких заборон"

highlightsStructure: рівно 5 рядків. Назви фіксовані: Послуги / Про мене / Підхід / Питання / Кейси.
Формат кожного рядка: «[Назва]: [конкретний підзаголовок під цю спеціалізацію] — [2–3 слайди що показати всередині]»
Приклад для нутриціолога по гормонах: «Послуги: харчування при інсулінорезистентності — формати роботи, що входить, як записатися»

pinnedPostIdeas: рівно 3 рядки. Кожен: «[Схема] | [конкретна тема під ніщу цього профілю] | [перший рядок-хук для цього посту]»
Три обов'язкові схеми:
  1. "Знайомство" — хто ти, для кого, головний результат, твій підхід, кому НЕ підходиш, CTA
  2. "Кейс До/Після/Міст" — конкретна деталь результату (не "схудла", а "перший раз за рік з'їла торт без провини"), механіка що зробили, CTA
  3. "Хак/Поворот/Злам" — міф який всі вважають правдою → несподіваний поворот → твій підхід → CTA з кодовим словом

quickWins: рівно 3 рядки. Базуй ВИКЛЮЧНО на тому що відсутнє або слабке в конкретному bio — не давай загальних порад якщо bio вже їх враховує.
Формат: «[Конкретна дія з прив'язкою до цього bio] → [очікуваний ефект] (час: X хв)»
Пріоритет: спочатку найкритичніша категорія (найнижчий score), потім наступна.`

router.post('/audit', liteAuditLimiter, async (req, res) => {
  const { profession, bio, offerType, clientTransformation, instagramUrl } = req.body as {
    profession?: string
    bio?: string
    offerType?: string
    clientTransformation?: string
    instagramUrl?: string
  }

  if (!profession || !bio) {
    res.status(400).json({ error: 'profession and bio are required' })
    return
  }

  const contextLines: string[] = []
  if (offerType) contextLines.push(`Що продає: ${offerType}`)
  if (clientTransformation) contextLines.push(`Результат клієнта: ${clientTransformation}`)
  if (instagramUrl) contextLines.push(`Instagram: ${instagramUrl}`)
  const context = contextLines.length > 0 ? '\n' + contextLines.join('\n') : ''

  const prompt = `Проаналізуй Instagram-профіль спеціаліста і поверни JSON.

ДАНІ:
Спеціалізація: ${profession}
Bio: "${bio}"${context}

JSON (поверни тільки його, без коментарів):
{
  "overallScore": <число 1–100, формула: round((ніша×25 + результат×25 + довіра×20 + CTA×20 + диф×10) / 10)>,
  "verdict": "<одне речення — найголовніша проблема цього конкретного bio яка блокує конверсію>",
  "summary": "<2–3 речення: що саме не працює і чому холодний відвідувач іде не записавшись>",
  "scores": [
    {
      "category": "Ніша і аудиторія",
      "score": <1–10>,
      "label": "<'Добре' якщо >=7, 'Потребує роботи' якщо 4–6, 'Критично' якщо <=3>",
      "issue": "<цитата з bio яка не працює, або точний опис що відсутнє — без загальних слів>",
      "fix": "<готова фраза яку можна вставити в bio зараз + 1 речення чому це працює>"
    },
    { "category": "Результат і цінність", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Довіра і доказ", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Заклик до дії", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." },
    { "category": "Диференціація", "score": <1–10>, "label": "...", "issue": "...", "fix": "..." }
  ],
  "bioVariants": [
    { "strategy": "Від болю аудиторії", "text": "<починається з болю або ситуації клієнта цього профілю, max 150 символів>" },
    { "strategy": "Від результату", "text": "<починається з конкретного результату, max 150 символів>" },
    { "strategy": "Метод і диференціатор", "text": "<розкриває унікальний підхід цього спеціаліста, max 150 символів>" }
  ],
  "highlightsStructure": [
    "<Послуги: [підзаголовок під цю спеціалізацію] — [що показати всередині]>",
    "<Про мене: [підзаголовок] — [що показати]>",
    "<Підхід: [підзаголовок] — [що показати]>",
    "<Питання: [підзаголовок] — [що показати]>",
    "<Кейси: [підзаголовок] — [що показати]>"
  ],
  "pinnedPostIdeas": [
    "<Знайомство | [конкретна тема під цей профіль] | [перший рядок-хук цього посту]>",
    "<Кейс До/Після/Міст | [конкретна тема] | [перший рядок-хук з деталлю результату]>",
    "<Хак/Поворот/Злам | [міф з ніші цього спеціаліста] | [перший рядок-хук]>"
  ],
  "quickWins": [
    "<[конкретна дія прив'язана до слабкого місця цього bio] → [ефект] (X хв)>",
    "<[друга дія] → [ефект] (X хв)>",
    "<[третя дія] → [ефект] (X хв)>"
  ]
}`

  try {
    const msg = await getClient().messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const audit = JSON.parse(clean)
    res.json(audit)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[lite/audit]', detail)
    res.status(500).json({ error: 'Generation failed', detail })
  }
})

// ── Instagram profile fetch via Apify ────────────────────────────────────

function normalizeHandle(raw: string): string {
  const s = raw.trim()
  const urlMatch = s.match(/instagram\.com\/([A-Za-z0-9._]+)/)
  if (urlMatch) return urlMatch[1]
  return s.replace(/^@/, '')
}

router.get('/profile', async (req, res) => {
  const raw = req.query.handle as string | undefined
  if (!raw) { res.status(400).json({ error: 'handle is required' }); return }

  const handle = normalizeHandle(raw)
  if (!handle) { res.status(400).json({ error: 'Invalid handle' }); return }

  const token = process.env.APIFY_TOKEN
  if (!token) { res.status(503).json({ error: 'not_configured' }); return }

  try {
    const url = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${token}`

    const apifyRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usernames: [handle] }),
      signal: AbortSignal.timeout(55_000),
    })

    if (!apifyRes.ok) {
      const text = await apifyRes.text()
      console.error('[lite/profile] Apify error', apifyRes.status, text.slice(0, 200))
      res.status(502).json({ error: 'Could not fetch Instagram profile' })
      return
    }

    const items = await apifyRes.json() as Record<string, unknown>[]

    if (!items || items.length === 0) {
      res.status(404).json({ error: 'not_found', message: 'Профіль не знайдено' })
      return
    }

    const d = items[0]
    const isPrivate = Boolean(d.private ?? d.isPrivate)

    if (isPrivate) {
      res.json({
        username: String(d.username ?? handle),
        fullName: String(d.fullName ?? ''),
        bio: '',
        followers: Number(d.followersCount ?? d.follower_count ?? 0),
        following: Number(d.followsCount ?? d.following_count ?? 0),
        mediaCount: Number(d.postsCount ?? d.media_count ?? 0),
        isPrivate: true,
      })
      return
    }

    res.json({
      username: String(d.username ?? handle),
      fullName: String(d.fullName ?? ''),
      bio: String(d.biography ?? d.bio ?? ''),
      followers: Number(d.followersCount ?? d.follower_count ?? 0),
      following: Number(d.followsCount ?? d.following_count ?? 0),
      mediaCount: Number(d.postsCount ?? d.media_count ?? 0),
      isPrivate: false,
    })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[lite/profile]', detail)
    res.status(500).json({ error: 'Fetch failed', detail })
  }
})

// ── form submissions → Telegram notification ──────────────────────────────

const FIELD_LABELS: Record<string, string> = {
  name: 'Ім\'я',
  niche: 'Ніша',
  instagram: 'Instagram',
  mainPain: 'Головний біль',
  why: 'Чому зацікавились',
  betaConsent: 'Beta-тестер',
  hasActivePractice: 'Активна практика',
  currentOffers: 'Поточні офери',
  instagramStatus: 'Статус Instagram',
  mainGoal: 'Головна ціль',
  whyAccess: 'Чому хоче beta',
  contact: 'Контакт',
  whatToSee: 'Що хоче побачити в демо',
}

const TYPE_LABEL: Record<string, string> = {
  waitlist: '📋 Нова заявка у Waitlist',
  beta: '🚀 Нова Beta-заявка',
  demo: '📅 Запит на Demo',
}

function buildTelegramText(type: string, data: Record<string, unknown>): string {
  const ts = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kiev' })
  const header = TYPE_LABEL[type] ?? `📥 ${type}`
  const lines = [header, `🕐 ${ts}`, '']
  for (const [key, val] of Object.entries(data)) {
    if (key === 'submittedAt' || val === '' || val === null || val === undefined) continue
    const label = FIELD_LABELS[key] ?? key
    const value = typeof val === 'boolean' ? (val ? 'Так' : 'Ні') : String(val)
    lines.push(`${label}: ${value}`)
  }
  return lines.join('\n')
}

async function notifyTelegram(type: string, data: Record<string, unknown>): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return
  const text = buildTelegramText(type, data)
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })
}

router.post('/submit', submitLimiter, async (req, res) => {
  const { type, data } = req.body as { type?: string; data?: Record<string, unknown> }
  if (!type || !data) {
    res.status(400).json({ error: 'type and data are required' })
    return
  }
  try {
    db.insert(liteSubmissions).values({
      id: randomUUID(),
      type: type as 'waitlist' | 'beta' | 'demo',
      data: JSON.stringify(data),
      createdAt: new Date(),
    }).run()
  } catch (err) {
    console.error('[lite/submit/db]', err)
  }

  try {
    await notifyTelegram(type, data)
  } catch (err) {
    console.error('[lite/submit/telegram]', err)
  }

  sendLiteSubmissionNotification(
    type as 'waitlist' | 'beta' | 'demo',
    data
  ).catch(err => console.error('[lite/submit/email]', err))

  res.json({ ok: true })
})

export default router
