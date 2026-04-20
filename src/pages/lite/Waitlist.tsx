import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics'

interface FormData {
  name: string
  niche: string
  instagram: string
  mainPain: string
  why: string
  betaConsent: boolean
}

interface Errors {
  name?: string
  niche?: string
  mainPain?: string
}

const PAIN_OPTIONS = [
  { value: '', label: 'Оберіть...' },
  { value: 'offer', label: 'Не розумію, як оформити офер' },
  { value: 'leads', label: 'Профіль є, але заявок немає' },
  { value: 'content', label: 'Не знаю, що і як публікувати' },
  { value: 'system', label: 'Хочу системно, а не хаотично' },
  { value: 'clarity', label: 'Складно сформулювати, що я продаю' },
]

type Stage = 'form' | 'success'

function validate(data: FormData): Errors {
  const errors: Errors = {}
  if (!data.name.trim() || data.name.trim().length < 2) {
    errors.name = "Вкажіть ваше ім'я"
  }
  if (!data.niche.trim() || data.niche.trim().length < 2) {
    errors.niche = 'Вкажіть вашу нішу'
  }
  if (!data.mainPain) {
    errors.mainPain = 'Оберіть головний біль'
  }
  return errors
}

export default function LiteWaitlist() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('form')
  const [form, setForm] = useState<FormData>({
    name: '', niche: '', instagram: '', mainPain: '', why: '', betaConsent: false,
  })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  useEffect(() => {
    track('waitlist_start', { source: 'direct' })
  }, [])

  function handleBlur(field: keyof FormData) {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(validate(form))
  }

  function handleChange(field: keyof FormData, value: string | boolean) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field]) setErrors(validate(next))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched = { name: true, niche: true, mainPain: true }
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    const submission = { ...form, submittedAt: new Date().toISOString() }

    track('waitlist_submit', { niche: form.niche, has_beta_consent: form.betaConsent })

    fetch('/api/lite/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'waitlist', data: submission }),
    }).catch(() => {/* silent */})

    setStage('success')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
          <button
            onClick={() => navigate('/lite')}
            className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer"
          >
            Naukroom
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/lite/tool')}>
            ← Назад до аудиту
          </Button>
        </div>
      </header>

      <div className="flex-1 flex items-start justify-center px-5 py-12">
        <div className="w-full max-w-[480px]">
          <AnimatePresence mode="wait">
            {stage === 'form' && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              >
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Ранній доступ</p>
                <h1 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-2">
                  Залишіть заявку на Naukroom
                </h1>
                <p className="type-body text-[rgba(0,0,0,0.55)] mb-8">
                  Перші 50 учасників отримають ранній доступ зі знижкою.
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">Ваше ім'я</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Ваше ім'я"
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                    {touched.name && errors.name && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.name}</p>
                    )}
                  </div>

                  {/* Niche */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">Ваша ніша</label>
                    <input
                      type="text"
                      value={form.niche}
                      onChange={e => handleChange('niche', e.target.value)}
                      onBlur={() => handleBlur('niche')}
                      placeholder="Нутриціолог, health coach, косметолог..."
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                    {touched.niche && errors.niche && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.niche}</p>
                    )}
                  </div>

                  {/* Instagram */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Instagram{' '}
                      <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
                    </label>
                    <input
                      type="text"
                      value={form.instagram}
                      onChange={e => handleChange('instagram', e.target.value)}
                      placeholder="@yourhandle"
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                  </div>

                  {/* Main pain */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">Головний біль</label>
                    <select
                      value={form.mainPain}
                      onChange={e => handleChange('mainPain', e.target.value)}
                      onBlur={() => handleBlur('mainPain')}
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors bg-white appearance-none"
                      style={{ color: form.mainPain ? 'inherit' : 'rgba(0,0,0,0.3)' }}
                    >
                      {PAIN_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} disabled={o.value === ''}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                    {touched.mainPain && errors.mainPain && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.mainPain}</p>
                    )}
                  </div>

                  {/* Why */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Чому зацікавилися{' '}
                      <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
                    </label>
                    <textarea
                      value={form.why}
                      onChange={e => handleChange('why', e.target.value)}
                      placeholder="Що саме хочете вирішити за допомогою Naukroom?"
                      maxLength={300}
                      rows={3}
                      className="px-4 py-3 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors resize-none leading-[1.5] placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                  </div>

                  {/* Beta consent */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.betaConsent}
                      onChange={e => handleChange('betaConsent', e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-black/20 accent-[oklch(0.52_0.24_285)]"
                    />
                    <span className="type-body text-[rgba(0,0,0,0.65)]">
                      Готовий(а) протестувати beta-версію і дати зворотній зв'язок
                    </span>
                  </label>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button type="submit" size="lg">
                      Залишити заявку
                    </Button>
                    <p className="text-center text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Без спаму. Лише анонс запуску.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {stage === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="flex flex-col items-center text-center gap-6 py-12"
              >
                <div className="w-14 h-14 rounded-full bg-[oklch(0.56_0.17_155/0.1)] flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-[oklch(0.56_0.17_155)]" />
                </div>
                <div>
                  <h2 className="text-[1.5rem] fw-400 tracking-[-0.5px] leading-[1.2] mb-2">
                    Заявку прийнято
                  </h2>
                  <p className="type-body text-[rgba(0,0,0,0.55)] max-w-[360px]">
                    Ми зв'яжемося з вами, коли відкриємо ранній доступ.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                  <Button
                    size="lg"
                    onClick={() => {
                      track('telegram_join', { page: 'waitlist_success' })
                      window.open('https://t.me/naukroom', '_blank')
                    }}
                  >
                    Приєднатися до Telegram
                  </Button>
                  <Button variant="ghost" size="md" onClick={() => navigate('/lite')}>
                    Повернутися на головну
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
