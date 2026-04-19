/**
 * Demo seed script — creates a ready-to-show account with all outputs pre-generated.
 * Run once: npx tsx server/seed-demo.ts
 * Re-run safe: deletes existing demo user first.
 */

import bcryptjs from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { db } from './db/index.js'
import { users, businessProfiles, generatedOutputs } from './db/schema.js'

const DEMO_EMAIL = 'demo@naukroom.app'
const DEMO_PASSWORD = 'demo1234'

// Delete existing demo user
const existing = db.select({ id: users.id }).from(users).where(eq(users.email, DEMO_EMAIL)).get()
if (existing) {
  db.delete(generatedOutputs).where(eq(generatedOutputs.userId, existing.id)).run()
  db.delete(businessProfiles).where(eq(businessProfiles.userId, existing.id)).run()
  db.delete(users).where(eq(users.id, existing.id)).run()
  console.log('Deleted existing demo user.')
}

const userId = crypto.randomUUID()
const hash = await bcryptjs.hash(DEMO_PASSWORD, 10)

// Create user
db.insert(users).values({
  id: userId,
  email: DEMO_EMAIL,
  password: hash,
  name: 'Марина Шевченко',
  role: 'user',
  onboardingStatus: 'completed',
  createdAt: new Date(),
}).run()

// Create business profile
const profileId = crypto.randomUUID()
db.insert(businessProfiles).values({
  id: profileId,
  userId,
  name: 'Марина Шевченко',
  profession: 'Нутриціолог',
  specialization: 'Нутриціолог, спеціалізація — стабілізація харчування та позбавлення від зривів',
  country: 'Україна',
  language: 'Українська',
  workFormat: 'online',
  clientType: 'Жінки 28–45, хочуть налагодити харчування без жорстких дієт',
  clientGenderAge: 'Жінки, 28–45 років',
  clientPains: JSON.stringify([
    'Постійно зриваюсь і починаю знову',
    'Не можу вибудувати стабільний режим харчування',
    'Після дієти вага повертається',
    'Відчуваю провину після їжі',
  ]),
  clientDesiredResults: JSON.stringify([
    'Харчуватись без заборон і без зривів',
    'Відчувати стабільність і контроль',
    'Мати більше енергії',
  ]),
  currentServices: JSON.stringify([
    'Індивідуальна консультація (60 хв)',
    '4-тижневий онлайн-супровід',
    'Складання плану харчування',
  ]),
  currentPrices: '1200–4500 грн',
  targetServices: JSON.stringify([
    '4-тижневий супровід "Без зривів"',
    'Стартова діагностика (безкоштовно)',
  ]),
  idealClients: 'Жінки з багаторічною historією дієт і зривів, які хочуть нарешті вибудувати стабільну систему',
  avoidClients: 'Клієнти, які хочуть схуднути за 2 тижні без змін у способі житт',
  instagramUrl: 'https://instagram.com/marina.nutri.ua',
  postScreenshots: JSON.stringify([]),
  competitors: JSON.stringify([
    '@nutri.life.ua',
    '@food_balance_ua',
    '@svetlana_diety',
  ]),
  goals: JSON.stringify(['більше заявок', 'консультації', 'продаж супроводу']),
  primaryGoal: 'більше заявок',
  currentStep: 9,
  updatedAt: new Date(),
}).run()

// Pre-generated outputs
const outputs = [
  {
    type: 'positioning_summary',
    content: JSON.stringify({
      positioning_statement: 'Нутриціолог для жінок 28–45 років, які роками зриваються в харчуванні. Допомагаю вибудувати просту систему їжі без заборон — щоб зривів стало менше, а енергії більше.',
      target_audience: 'Жінки 28–45 з тривалою历史 дієт і зривів',
      core_value: 'Стабільне харчування без жорстких правил і провини',
      differentiator: 'Фокус не на схудненні, а на стабільності — без дієтного мислення',
      tone: 'Підтримуючий, конкретний, без осуду',
      bio_variants: [
        'Нутриціолог для жінок 30+ | Налагоджую харчування без дієт | Менше зривів • більше енергії | Напишіть СТАРТ в Direct → отримайте чекліст',
        'Допомагаю жінкам зупинити цикл зривів | Без заборон і провини | 4-тижневий супровід | Написати СТАРТ у Direct',
        'Нутриціолог • Харчування без дієт | Для тих, хто втомився від зривів | Стабільність через систему | Direct: СТАРТ',
      ],
    }),
  },
  {
    type: 'profile_audit',
    content: JSON.stringify({
      summary: 'Профіль має потенціал, але зараз не відображає чіткого фокусу. Bio занадто загальне, Highlights не структуровані, першого контакту немає.',
      problems: [
        'Bio не пояснює, хто конкретно клієнт і яку проблему вирішуєте',
        'Відсутній заклик до дії з кодовим словом',
        'Highlights мають розмиті назви без зв\'язку з послугами',
        'Посилання не веде на конкретну дію',
      ],
      strengths: [
        'Контент регулярний і живий',
        'Є особисті пости — формується довіра',
        'Аудиторія активна в коментарях',
      ],
      improved_bio: [
        'Нутриціолог для жінок 30+ | Зупиняю цикл зривів | Без дієт • без провини | Напишіть СТАРТ у Direct → чекліст',
      ],
      highlights_structure: [
        '🎯 Про мене', '✅ Як я працюю', '💬 Відгуки', '📋 Послуги', '🎁 Безкоштовно',
      ],
      pinned_posts_suggestions: [
        'Чому ви постійно зриваєтесь (і це не ваша провина)',
        'Що таке 4-тижневий супровід і як він виглядає',
        'Мій метод: харчування без заборон',
      ],
      priority_fixes: [
        'Оновити Bio — додати для кого, яку проблему і CTA',
        'Переструктурувати Highlights (5 ключових)',
        'Закріпити 3 пояснюючих пости',
      ],
    }),
  },
  {
    type: 'offer',
    content: JSON.stringify({
      positioning_statement: 'Нутриціолог для жінок, які зриваються в харчуванні — допомагаю вийти з циклу дієт і побудувати стабільну систему',
      core_offer: '4-тижневий онлайн-супровід "Без зривів" — індивідуальна програма харчування, щотижневий розбір і підтримка в чаті',
      secondary_offers: [
        'Стартова діагностика харчування (безкоштовно, 20 хв)',
        'Одноразова консультація з планом (60 хв, 1200 грн)',
      ],
      ideal_client_summary: 'Жінка 30–45 з роками дієтного досвіду і зривів, яка хоче нарешті мати стабільність без жорстких правил',
      main_problem: 'Постійні зриви і повернення до старих звичок, провина після їжі, відчуття що "не вистачає сили волі"',
      desired_result: 'Харчуватись без заборон, без зривів, з більшою енергією та відчуттям контролю',
      recommended_entry_offer: 'Безкоштовна 20-хвилинна діагностика в Direct',
      recommended_cta: 'Напишіть СТАРТ у Direct — проведу безкоштовну діагностику вашого харчування',
    }),
  },
  {
    type: 'lead_magnet',
    content: JSON.stringify({
      title: '5 причин, чому ви зриваєтесь ввечері — і як це зупинити',
      audience: 'Жінки 28–45, які мають регулярні зриви в харчуванні ввечері',
      pain: 'Вдень тримаюсь, а ввечері їм все підряд — і потім відчуваю провину',
      promise: 'Зрозуміти реальні причини вечірніх зривів і отримати 3 конкретних кроки для стабілізації',
      outline: [
        'Чому вечірній зрив — це не слабкість',
        'Причина 1: недоїдання зранку',
        'Причина 2: емоційний стрес без виходу',
        'Причина 3: жорсткі заборони вдень',
        'Причина 4: немає структури вечері',
        'Причина 5: неправильне завершення дня',
        '3 конкретних кроки на цей тиждень',
      ],
      CTA: 'Написати СТАРТ у Direct — отримати чекліст',
      next_step: 'Безкоштовна 20-хвилинна діагностика харчування',
    }),
  },
  {
    type: 'funnel',
    content: JSON.stringify({
      goal: 'Завести підписника через Reels → підписку → Direct → безкоштовну діагностику → оплачений супровід',
      trigger_content: 'Reels: "Якщо ввечері вас тягне на все солодке — проблема в сніданку"',
      code_word: 'СТАРТ',
      first_dm: 'Дякую, що написали! Тримайте чекліст "5 причин вечірніх зривів" → [посилання]. Хочете розберемо вашу конкретну ситуацію? Можу провести безкоштовну 20-хвилинну діагностику.',
      follow_up_1: '(через 2 дні) Як вам чекліст? Чи є в ньому щось, що відгукується? Якщо хочете — розберемо ваш конкретний зрив-патерн.',
      follow_up_2: '(через 5 днів) Якщо ще не встигли пройти діагностику — я виділяю кілька місць на цьому тижні. Напишіть ДА — домовимось про час.',
      handoff_to_expert: 'Після діагностики Марина особисто пояснює, який формат роботи підійде і чому.',
      conversion_target: '4-тижневий супровід "Без зривів" — 4500 грн',
    }),
  },
  {
    type: 'content_pack',
    content: JSON.stringify({
      content_items: [
        {
          title: 'Чому зриви — це не ваша слабкість',
          pain: 'Відчуваю провину і сором після зриву',
          angle: 'Зриви — симптом системи, не характеру',
          related_offer: '4-тижневий супровід "Без зривів"',
          related_magnet: 'Чекліст "5 причин вечірніх зривів"',
          hook: 'Якщо ви зриваєтесь щотижня — це не ваша провина. Це сигнал, що система не працює.',
          key_message: 'Зриви виникають через систему, а не характер. Правильна система прибирає зриви сама.',
          CTA: 'Напишіть СТАРТ у Direct — отримайте чекліст',
          scene_plan: [
            '1. Крупний план, hook зі слів',
            '2. "Ось що насправді відбувається в мозку під час зриву"',
            '3. 3 реальні причини (текстові карточки)',
            '4. "Змінити характер неможливо — але систему харчування можна"',
            '5. CTA: написати СТАРТ у Direct',
          ],
          caption_draft: 'Якщо ви зриваєтесь — це не означає, що у вас немає сили волі.\n\nЦе означає, що ваша система харчування не дає достатньо ресурсу.\n\nЗриви прибираються не через "більше контролю" — а через правильну структуру.\n\nНапишіть СТАРТ у Direct → отримаєте чекліст причин вечірніх зривів 🎁',
        },
        {
          title: 'Різниця між дієтою і системою харчування',
          pain: 'Пробую дієти — вага повертається',
          angle: 'Дієта = тимчасово. Система = назавжди.',
          related_offer: '4-тижневий супровід',
          related_magnet: '5 причин зривів',
          hook: 'Ви вже пробували 5+ дієт? Значить, проблема не у вас — а в підході.',
          key_message: 'Дієта дає результат на час. Система харчування — на все життя.',
          CTA: 'Написати СТАРТ у Direct',
          scene_plan: [
            '1. Hook — питання до камери',
            '2. Таблиця: Дієта vs Система (3 рядки)',
            '3. Що змінюється за 4 тижні правильної системи',
            '4. CTA',
          ],
          caption_draft: 'Дієта дає -5 кг за місяць.\nСистема харчування дає стабільність на роки.\n\nОдна відмінність: дієта виключає. Система будує.\n\nНапишіть СТАРТ — розкажу, як виглядає системний підхід без заборон.',
        },
      ],
    }),
  },
]

for (const o of outputs) {
  db.insert(generatedOutputs).values({
    id: crypto.randomUUID(),
    userId,
    type: o.type as never,
    content: o.content,
    qaScore: JSON.stringify({ score: 87, passed: true, issues: [], rewrittenFields: {} }),
    status: 'approved',
    adminNotes: 'Pre-seeded demo content',
    approvedBy: 'seed-script',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).run()
}

console.log(`
Demo account created:
  Email:    ${DEMO_EMAIL}
  Password: ${DEMO_PASSWORD}
  Outputs:  ${outputs.length} (all approved)
`)
