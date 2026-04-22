import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { track, readUTM } from '@/lib/analytics'

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 30, delay: i * 0.08 },
  }),
}

const WHAT_YOU_GET = [
  {
    label: '3 конкретні проблеми профілю',
    desc: 'Не загальні поради - точки, де втрачаються клієнти',
    color: 'oklch(0.52 0.24 285)',
    bg: 'oklch(0.52 0.24 285 / 0.05)',
  },
  {
    label: 'Переписаний Bio',
    desc: 'Приклад Bio під вашу нішу - можна адаптувати і використовувати',
    color: 'oklch(0.56 0.18 195)',
    bg: 'oklch(0.56 0.18 195 / 0.05)',
  },
  {
    label: 'Напрямок першого оферу',
    desc: 'З чого почати продажі через Instagram у вашій ніші',
    color: 'oklch(0.60 0.20 22)',
    bg: 'oklch(0.60 0.20 22 / 0.05)',
  },
]

const FULL_MODULES = [
  { label: 'Повний аудит профілю', color: 'oklch(0.52 0.24 285)' },
  { label: 'Позиціонування і офер', color: 'oklch(0.56 0.18 195)' },
  { label: 'Упаковка профілю', color: 'oklch(0.60 0.20 22)' },
  { label: '1–3 лід-магніти', color: 'oklch(0.68 0.17 72)' },
  { label: 'Воронка в Direct', color: 'oklch(0.56 0.17 155)' },
  { label: '10 сценаріїв Reels', color: 'oklch(0.50 0.22 258)' },
]

const NOT_CHATGPT = [
  'Заточено під health/wellness-нішу - не universal AI',
  'Логіка: профіль → офер → лід-магніт → продаж (не просто текст)',
  'Структурований результат, готовий до впровадження',
]

const FAQ = [
  {
    q: 'Що таке цей інструмент?',
    a: 'AI-аудит Instagram-профілю для health-експертів. Ви вводите Bio - отримуєте конкретний аналіз і першу рекомендацію.',
  },
  {
    q: 'Хто це для?',
    a: 'Нутриціологи, health coaches, косметологи та інші wellness-спеціалісти, які ведуть Instagram.',
  },
  {
    q: 'Чим відрізняється від ChatGPT?',
    a: 'Naukroom знає вашу нішу і мислить системно: профіль, офер, лід-магніт і контент - це одна зв\'язана логіка, а не окремі тексти.',
  },
  {
    q: 'Що після безкоштовного тесту?',
    a: 'Можете залишити заявку на ранній доступ до повної версії з усіма модулями.',
  },
]

export default function LiteLanding() {
  const navigate = useNavigate()

  useEffect(() => {
    track('landing_view', readUTM())
  }, [])

  function handleTryClick(label: string, position: string) {
    track('cta_click', { cta_label: label, page: 'lite_landing', position })
    navigate('/lite/tool')
  }

  return (
    <div className="min-h-screen bg-white hero-gradient">
      {/* Nav */}
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer"
          >
            Naukroom
          </button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Увійти</Button>
            <Button size="sm" onClick={() => handleTryClick('Спробувати', 'nav')}>
              Спробувати
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-20">
        <motion.p
          initial="hidden" animate="visible" variants={spring} custom={0}
          className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4"
        >
          Безкоштовний AI-аудит · для health-експертів
        </motion.p>
        <motion.h1
          initial="hidden" animate="visible" variants={spring} custom={1}
          className="text-[1.875rem] sm:text-[2.6rem] md:text-[3.5rem] fw-320 tracking-[-2px] leading-[1.05] max-w-[620px] mb-5"
        >
          Дізнайтеся, чому ваш Instagram не приводить до заявок
        </motion.h1>
        <motion.p
          initial="hidden" animate="visible" variants={spring} custom={2}
          className="type-body-lg text-[rgba(0,0,0,0.6)] max-w-[500px] mb-8"
        >
          Введіть ваше Bio - отримайте 3 конкретні проблеми, переписаний профіль і перший крок.
          За 1 хвилину, без реєстрації.
        </motion.p>
        <motion.div
          initial="hidden" animate="visible" variants={spring} custom={3}
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
        >
          <Button size="lg" onClick={() => handleTryClick('Спробувати безкоштовно', 'hero')}>
            Спробувати безкоштовно <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
          <Button
            variant="ghost" size="lg"
            onClick={() => {
              track('cta_click', { cta_label: 'Отримати ранній доступ', page: 'lite_landing', position: 'hero_secondary' })
              navigate('/lite/waitlist')
            }}
          >
            Отримати ранній доступ
          </Button>
        </motion.div>
      </section>

      <div className="border-t border-black/8" />

      {/* What you get */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-8"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Що ви отримаєте</p>
          <h2 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.1]">
            Результат - за 60 секунд
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-4">
          {WHAT_YOU_GET.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.07 }}
              className="p-5 rounded-[8px] border border-black/8"
              style={{ background: item.bg, borderTopColor: item.color, borderTopWidth: 3 }}
            >
              <div className="w-2 h-2 rounded-full mb-3" style={{ background: item.color }} />
              <p className="fw-480 text-[0.9375rem] tracking-[-0.1px] mb-2">{item.label}</p>
              <p className="type-body text-[rgba(0,0,0,0.55)]">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* Demo preview - mock result card */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-8"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Приклад результату</p>
          <h2 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.1]">
            Ось як виглядає аудит
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 240, damping: 28 }}
          className="rounded-[8px] border border-black/10 overflow-hidden"
        >
          {/* Mock result header */}
          <div className="px-5 py-4 border-b border-black/8 flex items-center justify-between">
            <div>
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Результат аналізу</p>
              <p className="fw-480 text-[0.9375rem] mt-0.5">Нутриціолог</p>
            </div>
            <Sparkles className="h-4 w-4 text-[oklch(0.52_0.24_285)]" />
          </div>

          {/* Problems */}
          <div className="px-5 py-4 border-b border-black/8">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Що заважає профілю продавати</p>
            <div className="flex flex-col gap-2.5">
              {[
                'Bio не пояснює, кому ви допомагаєте і який результат вони отримають',
                'Немає чіткого першого кроку для нового підписника',
                'Відсутній лід-магніт - немає причини підписатися саме зараз',
              ].map((p, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-[oklch(0.60_0.20_22)]" />
                  <p className="type-body text-[rgba(0,0,0,0.75)]">{p}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Rewritten Bio */}
          <div className="px-5 py-4 border-b border-black/8">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Переписаний Bio</p>
            <p className="type-body text-[rgba(0,0,0,0.8)] font-[450]">
              Нутриціолог | Допомагаю жінкам 30+ схуднути без жорстких дієт ✓ Безкоштовний гайд →
            </p>
          </div>

          {/* Blurred bottom CTA */}
          <div className="relative">
            <div className="px-5 py-4 opacity-30 pointer-events-none select-none">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Напрямок першого оферу</p>
              <p className="type-body text-[rgba(0,0,0,0.8)]">••••••••••••••••••••••••••••••••••</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white flex items-end justify-center pb-4">
              <Button size="sm" onClick={() => handleTryClick('Отримати свій результат', 'demo_preview')}>
                Отримати свій результат →
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      <div className="border-t border-black/8" />

      {/* Not just ChatGPT */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-8"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Чому не просто ChatGPT</p>
          <h2 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.1] max-w-[480px]">
            ChatGPT генерує текст. Naukroom будує систему.
          </h2>
        </motion.div>
        <div className="flex flex-col gap-4 max-w-[520px]">
          {NOT_CHATGPT.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.07 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[oklch(0.56_0.17_155)]" />
              <p className="type-body text-[rgba(0,0,0,0.75)]">{point}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-black/8" />

      {/* Full version preview */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-8"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Повна версія</p>
          <h2 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.1]">
            Lite - вхідна точка. Далі - весь маркетинг-пак.
          </h2>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {FULL_MODULES.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.06 }}
              className="flex items-center gap-2.5 px-4 py-3 rounded-[8px] border border-black/8"
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color }} />
              <p className="text-[0.875rem] fw-450 tracking-[-0.1px]">{m.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="type-body text-[rgba(0,0,0,0.45)] mt-4">
          Lite - безкоштовно. Повна версія - за заявкою на ранній доступ.
        </p>
      </section>

      <div className="border-t border-black/8" />

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <motion.div
          initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="mb-8"
        >
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Питання</p>
          <h2 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.1]">FAQ</h2>
        </motion.div>
        <div className="max-w-[560px] flex flex-col">
          {FAQ.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 260, damping: 28, delay: i * 0.06 }}
              className="py-5 border-b border-black/8 last:border-0"
            >
              <p className="fw-480 text-[0.9375rem] tracking-[-0.1px] mb-2">{f.q}</p>
              <p className="type-body text-[rgba(0,0,0,0.6)]">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main CTA */}
      <section className="cta-gradient">
        <div className="max-w-3xl mx-auto px-5 py-20 flex flex-col items-start gap-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <p className="type-mono-label text-white/40 mb-3">Почніть зараз</p>
            <h2 className="text-[2.2rem] fw-320 tracking-[-1px] leading-[1.05] mb-3 max-w-[480px] text-white">
              Безкоштовний розбір вашого Instagram-профілю
            </h2>
            <p className="type-body text-white/50 mb-8">Без реєстрації. Результат - за 60 секунд.</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-white! text-black! hover:bg-white/90!"
                onClick={() => handleTryClick('Спробувати безкоштовно', 'bottom_cta')}
              >
                Спробувати безкоштовно <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/20! text-white! hover:border-white/40!"
                onClick={() => {
                  track('cta_click', { cta_label: 'Отримати ранній доступ', page: 'lite_landing', position: 'bottom_secondary' })
                  navigate('/lite/waitlist')
                }}
              >
                Отримати ранній доступ
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="cta-gradient border-t border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="type-mono-label text-white/30">© 2025 Naukroom</span>
          <span className="type-mono-label text-white/30">AI-маркетинг · health-експерти</span>
        </div>
      </footer>
    </div>
  )
}
