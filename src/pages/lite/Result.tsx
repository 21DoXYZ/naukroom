import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, CheckCircle2, Copy, Check,
  ChevronRight, Sparkles, Send, Calendar, Bell,
  ArrowLeft, RefreshCw, Zap,
} from 'lucide-react'
import { track } from '@/lib/analytics'

interface AuditScore {
  category: string
  score: number
  label: 'Добре' | 'Потребує роботи' | 'Критично'
  issue: string
  fix: string
}

interface BioVariant {
  strategy: string
  text: string
}

interface ProfileAudit {
  overallScore: number
  verdict: string
  summary: string
  scores: AuditScore[]
  bioVariants: (BioVariant | string)[]
  highlightsStructure: string[]
  pinnedPostIdeas: string[]
  quickWins: string[]
}

interface LiteInput {
  profession: string
  bio: string
  offerType?: string
  clientTransformation?: string
  instagramUrl?: string
}

const FULL_MODULES = [
  { label: 'Повний аудит профілю', color: 'oklch(0.52 0.24 285)' },
  { label: 'Позиціонування і офер', color: 'oklch(0.56 0.18 195)' },
  { label: 'Упаковка профілю', color: 'oklch(0.60 0.20 22)' },
  { label: '1–3 лід-магніти', color: 'oklch(0.68 0.17 72)' },
  { label: 'Воронка в Direct', color: 'oklch(0.56 0.17 155)' },
  { label: '10 сценаріїв Reels', color: 'oklch(0.50 0.22 258)' },
]

const spring = (i: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.07 },
})

function labelColor(label: AuditScore['label']) {
  if (label === 'Добре') return 'oklch(0.56 0.17 155)'
  if (label === 'Потребує роботи') return 'oklch(0.68 0.17 72)'
  return 'oklch(0.60 0.20 22)'
}

function labelBg(label: AuditScore['label']) {
  if (label === 'Добре') return 'oklch(0.56 0.17 155 / 0.08)'
  if (label === 'Потребує роботи') return 'oklch(0.68 0.17 72 / 0.08)'
  return 'oklch(0.60 0.20 22 / 0.08)'
}

function getBioText(v: BioVariant | string): string {
  return typeof v === 'string' ? v : v.text
}

function getBioStrategy(v: BioVariant | string): string | null {
  return typeof v === 'string' ? null : v.strategy
}

interface NextStepOption {
  icon: React.ReactNode
  label: string
  desc: string
  cta: string
  href?: string
  route?: string
  event: string
  primary?: boolean
}

export default function LiteResult() {
  const navigate = useNavigate()
  const [input, setInput] = useState<LiteInput | null>(null)
  const [audit, setAudit] = useState<ProfileAudit | null>(null)
  const [bioCopied, setBioCopied] = useState(false)
  const [activeBioIdx, setActiveBioIdx] = useState(0)
  const [expandedScore, setExpandedScore] = useState<number | null>(0)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    track('result_view')

    const rawInput = sessionStorage.getItem('lite_input')
    const rawResult = sessionStorage.getItem('lite_result')

    if (rawInput) {
      try { setInput(JSON.parse(rawInput) as LiteInput) } catch { /* ignore */ }
    }

    if (rawResult) {
      try {
        const parsed = JSON.parse(rawResult) as ProfileAudit
        if (parsed && parsed.summary) {
          setAudit(parsed)
          return
        }
      } catch { /* ignore */ }
    }

    setFailed(true)
  }, [])

  function copyBio() {
    const v = audit?.bioVariants[activeBioIdx]
    if (!v) return
    const text = getBioText(v)
    navigator.clipboard.writeText(text).then(() => {
      setBioCopied(true)
      track('bio_copied', { variant: activeBioIdx })
      setTimeout(() => setBioCopied(false), 2000)
    })
  }

  const nextSteps: NextStepOption[] = [
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: 'Beta-доступ',
      desc: "Хочу спробувати повний продукт і дати зворотній зв'язок",
      cta: 'Подати заявку на beta →',
      route: '/lite/beta',
      event: 'beta_start',
      primary: true,
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: 'Живе демо',
      desc: 'Хочу побачити продукт у роботі з коментарями',
      cta: 'Записатися на демо →',
      route: '/lite/demo',
      event: 'demo_request',
    },
    {
      icon: <Send className="h-4 w-4" />,
      label: 'Telegram',
      desc: 'Слідкувати за розвитком, кейсами і анонсом запуску',
      cta: 'Приєднатися →',
      href: 'https://t.me/naukroom',
      event: 'telegram_join',
    },
    {
      icon: <Bell className="h-4 w-4" />,
      label: 'Waitlist',
      desc: 'Повідомте мені, коли відкриється ранній доступ',
      cta: 'Залишити заявку →',
      route: '/lite/waitlist',
      event: 'waitlist_start',
    },
  ]

  function handleNextStep(option: NextStepOption) {
    track('cta_click', { cta_label: option.label, page: 'lite_result', position: 'next_step' })
    track(option.event, { source: 'result' })
    if (option.href) window.open(option.href, '_blank')
    else if (option.route) navigate(option.route)
  }

  if (failed) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
          <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
            <button onClick={() => navigate('/lite')} className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer">
              Naukroom
            </button>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="text-center max-w-[360px]">
            <div className="w-12 h-12 rounded-full bg-black/5 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-5 w-5 text-[rgba(0,0,0,0.4)]" />
            </div>
            <h2 className="text-[1.25rem] fw-400 tracking-[-0.4px] mb-2">Щось пішло не так</h2>
            <p className="type-body text-[rgba(0,0,0,0.5)] mb-6">
              Не вдалося згенерувати аудит. Спробуйте ще раз.
            </p>
            <button
              onClick={() => navigate('/lite/tool')}
              className="flex items-center gap-2 mx-auto text-[0.9375rem] fw-450 text-[rgba(0,0,0,0.6)] hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Повернутися до форми
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!audit) return null

  const scoreColor = audit.overallScore >= 70
    ? 'oklch(0.56 0.17 155)'
    : audit.overallScore >= 45
      ? 'oklch(0.68 0.17 72)'
      : 'oklch(0.60 0.20 22)'

  const criticalCount = audit.scores.filter(s => s.label === 'Критично').length
  const weakCount = audit.scores.filter(s => s.label === 'Потребує роботи').length

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
          <button onClick={() => navigate('/lite')} className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer">
            Naukroom
          </button>
          <p className="type-mono-label text-[rgba(0,0,0,0.35)]">Результат аналізу</p>
        </div>
      </header>

      <div className="max-w-[640px] mx-auto px-5 py-10 flex flex-col gap-5">

        {/* Header block */}
        <motion.div {...spring(0)}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-[oklch(0.52_0.24_285)]" />
            <p className="type-mono-label text-[rgba(0,0,0,0.4)]">AI-аудит профілю</p>
          </div>
          <h1 className="text-[1.375rem] sm:text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-1">
            Ось що заважає вашому профілю продавати
          </h1>
          {input?.profession && (
            <p className="type-body text-[rgba(0,0,0,0.45)] mb-5">{input.profession}</p>
          )}

          {/* Score + verdict */}
          <div className="rounded-[8px] border border-black/10 overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-5 border-b border-black/8">
              <div className="flex flex-col items-center shrink-0">
                <span
                  className="text-[2.5rem] fw-540 tracking-[-1.5px] leading-none"
                  style={{ color: scoreColor }}
                >
                  {audit.overallScore}
                </span>
                <span className="text-[0.7rem] fw-400 text-[rgba(0,0,0,0.35)] mt-0.5 tabular-nums">/ 100</span>
              </div>
              <div className="hidden sm:block h-10 w-px bg-black/8 shrink-0" />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  {criticalCount > 0 && (
                    <span className="text-[0.7rem] fw-500 px-2 py-0.5 rounded-full bg-[oklch(0.60_0.20_22/0.08)] text-[oklch(0.60_0.20_22)]">
                      {criticalCount} критично
                    </span>
                  )}
                  {weakCount > 0 && (
                    <span className="text-[0.7rem] fw-500 px-2 py-0.5 rounded-full bg-[oklch(0.68_0.17_72/0.08)] text-[oklch(0.68_0.17_72)]">
                      {weakCount} потребує роботи
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verdict — main diagnosis */}
            {audit.verdict && (
              <div className="px-5 py-4 border-b border-black/8 bg-black/[0.015]">
                <div className="flex items-start gap-2.5">
                  <Zap className="h-4 w-4 mt-0.5 shrink-0 text-[rgba(0,0,0,0.5)]" />
                  <p className="text-[0.9375rem] fw-450 tracking-[-0.1px] text-[rgba(0,0,0,0.85)] leading-[1.5]">
                    {audit.verdict}
                  </p>
                </div>
              </div>
            )}

            <div className="px-5 py-4">
              <p className="type-body text-[rgba(0,0,0,0.65)] leading-[1.6]">{audit.summary}</p>
            </div>
          </div>
        </motion.div>

        {/* Score breakdown — 5 categories */}
        <motion.div {...spring(1)} className="rounded-[8px] border border-black/10 overflow-hidden">
          <div className="px-5 py-4 border-b border-black/8">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Оцінка по 5 критеріях</p>
          </div>
          <div className="flex flex-col divide-y divide-black/6">
            {audit.scores.map((s, i) => (
              <button
                key={i}
                onClick={() => setExpandedScore(expandedScore === i ? null : i)}
                className="w-full text-left px-5 py-3.5 hover:bg-black/[0.02] transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-[0.8rem] fw-540 tabular-nums shrink-0 w-[36px]"
                      style={{ color: labelColor(s.label) }}
                    >
                      {s.score}/10
                    </span>
                    <p className="text-[0.9rem] fw-450 tracking-[-0.1px] truncate">{s.category}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-[0.7rem] fw-500 px-2 py-0.5 rounded-full"
                      style={{ color: labelColor(s.label), background: labelBg(s.label) }}
                    >
                      {s.label}
                    </span>
                    <ChevronRight
                      className="h-3.5 w-3.5 text-[rgba(0,0,0,0.25)] transition-transform"
                      style={{ transform: expandedScore === i ? 'rotate(90deg)' : 'rotate(0deg)' }}
                    />
                  </div>
                </div>

                {expandedScore === i && (
                  <div className="mt-3.5 flex flex-col gap-3 text-left">
                    <div className="flex items-start gap-2.5 p-3 rounded-[6px] bg-black/[0.025]">
                      <AlertCircle
                        className="h-3.5 w-3.5 mt-0.5 shrink-0"
                        style={{ color: labelColor(s.label) }}
                      />
                      <p className="text-[0.8375rem] text-[rgba(0,0,0,0.75)] leading-[1.55]">{s.issue}</p>
                    </div>
                    <div className="flex items-start gap-2.5 p-3 rounded-[6px] bg-[oklch(0.56_0.17_155/0.04)] border border-[oklch(0.56_0.17_155/0.15)]">
                      <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[oklch(0.56_0.17_155)]" />
                      <p className="text-[0.8375rem] text-[rgba(0,0,0,0.8)] leading-[1.55] fw-430">{s.fix}</p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-black/6">
            <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
              Натисніть на категорію — побачите проблему і конкретне рішення
            </p>
          </div>
        </motion.div>

        {/* Bio variants with strategies */}
        {audit.bioVariants.length > 0 && (
          <motion.div
            {...spring(2)}
            className="rounded-[8px] border border-black/10 overflow-hidden"
            style={{ borderTopColor: 'oklch(0.52 0.24 285)', borderTopWidth: 3 }}
          >
            <div className="px-5 py-4 border-b border-black/8 flex items-center justify-between">
              <div>
                <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Переписане Bio</p>
                <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)] mt-0.5">3 варіанти з різними стратегіями</p>
              </div>
              <button
                onClick={copyBio}
                className="flex items-center gap-1.5 text-[0.8125rem] fw-450 text-[rgba(0,0,0,0.5)] hover:text-black transition-colors"
              >
                {bioCopied
                  ? <><Check className="h-3.5 w-3.5" /> Скопійовано</>
                  : <><Copy className="h-3.5 w-3.5" /> Скопіювати</>
                }
              </button>
            </div>

            {/* Strategy tabs */}
            {audit.bioVariants.length > 1 && (
              <div className="flex px-5 pt-4 gap-2 overflow-x-auto flex-nowrap pb-0.5">
                {audit.bioVariants.map((v, i) => {
                  const strategy = getBioStrategy(v)
                  return (
                    <button
                      key={i}
                      onClick={() => { setActiveBioIdx(i); setBioCopied(false) }}
                      className={[
                        'h-7 px-3 rounded-full text-[0.75rem] fw-450 transition-colors cursor-pointer whitespace-nowrap',
                        activeBioIdx === i
                          ? 'bg-[oklch(0.52_0.24_285/0.1)] text-[oklch(0.52_0.24_285)]'
                          : 'text-[rgba(0,0,0,0.4)] hover:text-black',
                      ].join(' ')}
                    >
                      {strategy ?? `Варіант ${i + 1}`}
                    </button>
                  )
                })}
              </div>
            )}

            <div className="px-5 py-4">
              <p className="type-body fw-450 text-[rgba(0,0,0,0.85)] leading-[1.65]">
                {getBioText(audit.bioVariants[activeBioIdx])}
              </p>
            </div>
            <div className="px-5 py-3 border-t border-black/6 flex items-center justify-between gap-3">
              <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                Адаптуйте під себе: замініть загальні фрази на ваші конкретні цифри і деталі
              </p>
              <span className={[
                'text-[0.75rem] fw-500 tabular-nums shrink-0',
                getBioText(audit.bioVariants[activeBioIdx]).length > 150
                  ? 'text-[oklch(0.60_0.20_22)]'
                  : 'text-[rgba(0,0,0,0.35)]',
              ].join(' ')}>
                {getBioText(audit.bioVariants[activeBioIdx]).length}/150
              </span>
            </div>
          </motion.div>
        )}

        {/* Quick wins */}
        {audit.quickWins.length > 0 && (
          <motion.div
            {...spring(3)}
            className="rounded-[8px] border border-black/10 overflow-hidden"
            style={{ borderTopColor: 'oklch(0.56 0.18 195)', borderTopWidth: 3 }}
          >
            <div className="px-5 py-4 border-b border-black/8">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Що зробити сьогодні</p>
              <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)] mt-0.5">Кожна дія — до 30 хвилин</p>
            </div>
            <div className="flex flex-col divide-y divide-black/6">
              {audit.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  <span className="text-[0.75rem] fw-540 text-[oklch(0.56_0.18_195)] mt-0.5 shrink-0 tabular-nums">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="type-body text-[rgba(0,0,0,0.8)]">{win}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pinned posts */}
        {audit.pinnedPostIdeas.length > 0 && (
          <motion.div
            {...spring(4)}
            className="rounded-[8px] border border-black/10 overflow-hidden"
            style={{ borderTopColor: 'oklch(0.68 0.17 72)', borderTopWidth: 3 }}
          >
            <div className="px-5 py-4 border-b border-black/8">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Закріплені пости</p>
              <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)] mt-0.5">Що першим бачить новий підписник</p>
            </div>
            <div className="flex flex-col divide-y divide-black/6">
              {audit.pinnedPostIdeas.map((idea, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  <span className="text-[0.75rem] fw-540 text-[oklch(0.68_0.17_72)] mt-0.5 shrink-0">
                    {i + 1}
                  </span>
                  <p className="type-body text-[rgba(0,0,0,0.8)]">{idea}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Highlights structure */}
        {audit.highlightsStructure.length > 0 && (
          <motion.div
            {...spring(5)}
            className="rounded-[8px] border border-black/10 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-black/8">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Структура Highlights</p>
            </div>
            <div className="flex flex-col divide-y divide-black/6">
              {audit.highlightsStructure.map((h, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-black/25 mt-2 shrink-0" />
                  <p className="text-[0.875rem] fw-330 text-[rgba(0,0,0,0.75)] leading-[1.55]">{h}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full version preview */}
        <motion.div {...spring(6)} className="rounded-[8px] border border-black/10 p-5">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Що є у повній версії</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            {FULL_MODULES.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: m.color }} />
                <p className="text-[0.875rem] fw-330 tracking-[-0.1px] text-[rgba(0,0,0,0.7)]">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
            Lite — вхідна точка. Повна версія — весь маркетинг-пак під вашу нішу і офер.
          </p>
        </motion.div>

        {/* Next steps */}
        <motion.div {...spring(7)}>
          <div className="mb-4">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-1">Наступний крок</p>
            <h2 className="text-[1.375rem] fw-400 tracking-[-0.5px] leading-[1.2]">
              Що підходить вам найкраще?
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {nextSteps.map((step, i) => (
              <motion.button
                key={i}
                onClick={() => handleNextStep(step)}
                whileTap={{ scale: 0.99 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={[
                  'w-full text-left rounded-[8px] border px-5 py-5 transition-colors cursor-pointer',
                  step.primary
                    ? 'border-[oklch(0.52_0.24_285/0.4)] bg-[oklch(0.52_0.24_285/0.04)] hover:bg-[oklch(0.52_0.24_285/0.08)]'
                    : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 shrink-0"
                      style={{ color: step.primary ? 'oklch(0.52 0.24 285)' : 'rgba(0,0,0,0.45)' }}
                    >
                      {step.icon}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="fw-480 text-[0.9375rem] tracking-[-0.1px]">{step.label}</p>
                        {step.primary && (
                          <span className="type-mono-label text-[oklch(0.52_0.24_285)] bg-[oklch(0.52_0.24_285/0.1)] px-2 py-0.5 rounded-full">
                            Рекомендовано
                          </span>
                        )}
                      </div>
                      <p className="type-body text-[rgba(0,0,0,0.55)]">{step.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-[rgba(0,0,0,0.3)]" />
                </div>
                <p
                  className="text-[0.8125rem] fw-450 mt-3 ml-7"
                  style={{ color: step.primary ? 'oklch(0.52 0.24 285)' : 'rgba(0,0,0,0.5)' }}
                >
                  {step.cta}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.p
          {...spring(8)}
          className="text-center text-[0.8125rem] text-[rgba(0,0,0,0.35)] pb-6"
        >
          Результат згенеровано AI на основі вашого Bio та контексту.
          Повний аналіз включає онбординг, перевірку профілю і всі модулі маркетинг-паку.
        </motion.p>
      </div>
    </div>
  )
}
