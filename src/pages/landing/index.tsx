import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const spring = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 30, delay: i * 0.09 },
  }),
}

const WHO_FOR = [
  'нутриціолог або health/wellness-експерт',
  'ведете Instagram, але не розумієте, чому він не приводить клієнтів',
  'не можете чітко пояснити, що саме продаєте',
  'не хочете ще один курс без впровадження',
  'хочете отримати готову систему, а не просто контент-генератор',
]

const DELIVERABLES = [
  { label: 'Аудит профілю', desc: 'Аналіз Instagram — що не працює і як виправити' },
  { label: 'Позиціонування та офер', desc: 'Чіткий офер, для кого і яка цінність' },
  { label: 'Упаковка профілю', desc: '3 варіанти Bio, структура Highlights, закріплені пости' },
  { label: '1–3 лід-магніти', desc: 'Під ваші послуги, з CTA і схемою дистрибуції' },
  { label: 'Воронка в Direct', desc: 'Reels → підписка → Direct → консультація' },
  { label: '10 сценаріїв Reels', desc: 'З хуками, сценами, CTA і типом контенту' },
]

const HOW_STEPS = [
  { n: '01', label: 'Проходите покроковий онбординг', desc: 'Розповідаєте про себе, аудиторію, послуги і цілі' },
  { n: '02', label: 'Система аналізує ваш профіль', desc: 'AI будує позиціонування, офер, лід-магніт і контент на основі ваших відповідей' },
  { n: '03', label: 'Отримуєте персоналізований маркетинг-пак', desc: 'Всі матеріали в одному місці — готові до використання' },
  { n: '04', label: 'Впроваджуєте в Instagram', desc: 'Починаєте системно залучати клієнтів' },
]

const FAQ = [
  { q: 'Це підійде тільки нутриціологам?', a: 'Перший фокус — нутриціологи та суміжні health/wellness-експерти: коучі, масажисти, косметологи, лікарі.' },
  { q: 'Це ще один AI-генератор постів?', a: 'Ні. Контент тут будується від вашого офера, болю клієнта, лід-магніта та наступного кроку у воронці.' },
  { q: 'Чи потрібно розбиратися в маркетингу?', a: 'Ні. Саме для цього і є guided onboarding та покрокова логіка системи.' },
  { q: 'Це замінює маркетолога?', a: 'Ні повністю. Але автоматизує значну частину стартової маркетингової роботи, яку часто роблять вручну.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white hero-gradient">
      {/* Nav */}
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Увійти</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Спробувати</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0}
          className="type-mono-label text-[rgba(0,0,0,0.4)] mb-5">
          AI-маркетинг для health-експертів
        </motion.div>
        <motion.h1 initial="hidden" animate="visible" variants={spring} custom={1}
          className="text-[3.5rem] md:text-[4.5rem] fw-320 tracking-[-2px] leading-[1.05] max-w-[720px] mb-6">
          Система, яка допоможе зібрати ваш Instagram у воронку клієнтів
        </motion.h1>
        <motion.p initial="hidden" animate="visible" variants={spring} custom={2}
          className="type-body-lg text-[rgba(0,0,0,0.6)] max-w-[540px] mb-10">
          Отримайте аудит профілю, сильний офер, упаковку, лід-магніт, просту воронку в Direct і контент, який веде до консультацій — без хаосу і без десятка окремих сервісів.
        </motion.p>
        <motion.div initial="hidden" animate="visible" variants={spring} custom={3}
          className="flex items-center gap-3">
          <Button size="lg" onClick={() => navigate('/register')}>
            Отримати ранній доступ <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="ghost" size="lg" onClick={() => navigate('/login')}>
            Увійти
          </Button>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="border-t border-black/8" />

      {/* For whom */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-10"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Для кого</p>
          <h2 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1]">
            Цей продукт для вас, якщо ви:
          </h2>
        </motion.div>
        <div className="flex flex-col gap-3">
          {WHO_FOR.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.07 }}
              className="flex items-start gap-3 py-3 border-b border-black/8 last:border-0"
            >
              <Check className="h-4 w-4 text-black mt-0.5 shrink-0" />
              <p className="text-[1rem] fw-330 tracking-[-0.1px]">{item}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-10"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Що ви отримаєте</p>
          <h2 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1]">
            Персоналізований маркетинг-пак
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {DELIVERABLES.map((d, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.07 }}
              className="p-5 border border-black/10 rounded-[8px]"
            >
              <p className="fw-480 text-[0.9375rem] tracking-[-0.1px] mb-2">{d.label}</p>
              <p className="type-body text-[rgba(0,0,0,0.55)]">{d.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-10"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Як це працює</p>
          <h2 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1]">
            4 кроки до готового пакету
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {HOW_STEPS.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.09 }}
              className="flex gap-5"
            >
              <span className="text-[2rem] fw-300 tracking-[-1px] text-[rgba(0,0,0,0.15)] shrink-0 leading-none mt-0.5">{s.n}</span>
              <div>
                <p className="fw-480 text-[0.9375rem] tracking-[-0.1px] mb-1.5">{s.label}</p>
                <p className="type-body text-[rgba(0,0,0,0.55)]">{s.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* Why not just AI */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-[600px]">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Чому це не просто AI</p>
            <p className="text-[1.5rem] fw-330 tracking-[-0.5px] leading-[1.4] text-[rgba(0,0,0,0.8)]">
              Це не інструмент «згенерувати текст». Це система, яка допомагає перетворити вашу експертність на просту й зрозумілу маркетингову модель: профіль, офер, лід-магніт, контент і продаж.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-10"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Питання</p>
          <h2 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1]">FAQ</h2>
        </motion.div>
        <div className="max-w-[640px] flex flex-col">
          {FAQ.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.07 }}
              className="py-5 border-b border-black/8 last:border-0"
            >
              <p className="fw-480 text-[0.9375rem] tracking-[-0.1px] mb-2">{f.q}</p>
              <p className="type-body text-[rgba(0,0,0,0.6)]">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="border-t border-black/8">
        <div className="max-w-5xl mx-auto px-6 py-20 flex flex-col items-start gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Готові спробувати?</p>
            <h2 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-6 max-w-[480px]">
              Отримайте ранній доступ до Naukroom
            </h2>
            <Button size="lg" onClick={() => navigate('/register')}>
              Подати заявку <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/8">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="type-mono-label text-[rgba(0,0,0,0.35)]">© 2025 Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.35)]">AI-маркетинг для health-експертів</span>
        </div>
      </footer>
    </div>
  )
}
