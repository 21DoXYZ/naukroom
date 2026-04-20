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
  whatToSee: string
  contact: string
}

interface Errors {
  name?: string
  niche?: string
  contact?: string
}

type Stage = 'form' | 'success'

function validate(data: FormData): Errors {
  const errors: Errors = {}
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = "Вкажіть ваше ім'я"
  if (!data.niche.trim() || data.niche.trim().length < 2) errors.niche = 'Вкажіть вашу нішу'
  if (!data.contact.trim() || data.contact.trim().length < 3) errors.contact = 'Вкажіть Telegram або email'
  return errors
}

export default function LiteDemo() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('form')
  const [form, setForm] = useState<FormData>({
    name: '', niche: '', instagram: '', whatToSee: '', contact: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  useEffect(() => {
    track('demo_request', { source: 'result' })
  }, [])

  function handleBlur(field: keyof FormData) {
    setTouched(t => ({ ...t, [field]: true }))
    setErrors(validate(form))
  }

  function handleChange(field: keyof FormData, value: string) {
    const next = { ...form, [field]: value }
    setForm(next)
    if (touched[field]) setErrors(validate(next))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched: Partial<Record<keyof FormData, boolean>> = {
      name: true, niche: true, contact: true,
    }
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    track('demo_submit', { niche: form.niche })

    fetch('/api/lite/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'demo', data: { ...form, submittedAt: new Date().toISOString() } }),
    }).catch(() => {/* silent */})

    setStage('success')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
          <button
            onClick={() => navigate('/lite')}
            className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer"
          >
            Naukroom
          </button>
          <Button variant="ghost" size="sm" onClick={() => navigate('/lite/result')}>
            ← Назад
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
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Живе демо</p>
                <h1 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-2">
                  Запишіться на демо продукту
                </h1>
                <p className="type-body text-[rgba(0,0,0,0.55)] mb-8">
                  Покажемо продукт у роботі: онбординг, генерацію і кінцевий результат для вашої ніші.
                  Тривалість - 20–30 хвилин.
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                  {/* Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">Ваше ім'я</label>
                    <input
                      type="text" value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Ім'я"
                      className={inputCls}
                    />
                    {touched.name && errors.name && <Err>{errors.name}</Err>}
                  </div>

                  {/* Niche */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">Ваша ніша</label>
                    <input
                      type="text" value={form.niche}
                      onChange={e => handleChange('niche', e.target.value)}
                      onBlur={() => handleBlur('niche')}
                      placeholder="Нутриціолог, health coach, косметолог..."
                      className={inputCls}
                    />
                    {touched.niche && errors.niche && <Err>{errors.niche}</Err>}
                  </div>

                  {/* Instagram */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Instagram <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
                    </label>
                    <input
                      type="text" value={form.instagram}
                      onChange={e => handleChange('instagram', e.target.value)}
                      placeholder="@yourhandle"
                      className={inputCls}
                    />
                    <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Якщо є - покажемо результат на прикладі вашого профілю
                    </p>
                  </div>

                  {/* What to see */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Що хочете побачити в демо?{' '}
                      <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
                    </label>
                    <textarea
                      value={form.whatToSee}
                      onChange={e => handleChange('whatToSee', e.target.value)}
                      placeholder="Наприклад: як виглядає аудит, що генерується у контент-паку, як працює воронка..."
                      rows={3}
                      maxLength={300}
                      className={textareaCls}
                    />
                  </div>

                  {/* Contact */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Telegram або email для зв'язку
                    </label>
                    <input
                      type="text" value={form.contact}
                      onChange={e => handleChange('contact', e.target.value)}
                      onBlur={() => handleBlur('contact')}
                      placeholder="@yourtelegram або email@example.com"
                      className={inputCls}
                    />
                    {touched.contact && errors.contact && <Err>{errors.contact}</Err>}
                    <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Ми напишемо і узгодимо зручний час
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button type="submit" size="lg">Записатися на демо</Button>
                    <p className="text-center text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Зв'яжемося протягом 24 годин.
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
                <div className="w-14 h-14 rounded-full bg-[oklch(0.56_0.18_195/0.1)] flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-[oklch(0.56_0.18_195)]" />
                </div>
                <div>
                  <h2 className="text-[1.5rem] fw-400 tracking-[-0.5px] leading-[1.2] mb-2">
                    Заявку прийнято
                  </h2>
                  <p className="type-body text-[rgba(0,0,0,0.55)] max-w-[360px]">
                    Зв'яжемося з вами протягом 24 годин і узгодимо зручний час для демо.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                  <Button
                    size="lg"
                    onClick={() => {
                      track('telegram_join', { page: 'demo_success' })
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

function Err({ children }: { children: React.ReactNode }) {
  return <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{children}</p>
}

const inputCls =
  'h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]'

const textareaCls =
  'px-4 py-3 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors resize-none leading-[1.5] placeholder:text-[rgba(0,0,0,0.3)]'
