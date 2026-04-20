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
  hasActivePractice: string
  currentOffers: string
  instagramStatus: string
  mainGoal: string
  whyAccess: string
  contact: string
}

interface Errors {
  name?: string
  niche?: string
  hasActivePractice?: string
  mainGoal?: string
  contact?: string
}

type Stage = 'form' | 'success'

const INSTAGRAM_STATUS_OPTIONS = [
  { value: '', label: 'Оберіть...' },
  { value: 'active', label: 'Веду активно, але продажів немає' },
  { value: 'passive', label: 'Є профіль, публікую рідко' },
  { value: 'new', label: 'Тільки починаю вести' },
  { value: 'none', label: 'Instagram поки немає' },
]

const MAIN_GOAL_OPTIONS = [
  { value: '', label: 'Оберіть...' },
  { value: 'positioning', label: 'Сформувати чітке позиціонування' },
  { value: 'leads', label: 'Почати отримувати заявки через Instagram' },
  { value: 'offer', label: 'Зрозуміти, що і як продавати' },
  { value: 'content', label: 'Збудувати контент-систему' },
  { value: 'full', label: 'Все вище одночасно' },
]

function validate(data: FormData): Errors {
  const errors: Errors = {}
  if (!data.name.trim() || data.name.trim().length < 2) errors.name = "Вкажіть ваше ім'я"
  if (!data.niche.trim() || data.niche.trim().length < 2) errors.niche = 'Вкажіть вашу нішу'
  if (!data.hasActivePractice) errors.hasActivePractice = 'Оберіть варіант'
  if (!data.mainGoal) errors.mainGoal = 'Оберіть головну ціль'
  if (!data.contact.trim() || data.contact.trim().length < 3) errors.contact = 'Вкажіть Telegram або email'
  return errors
}

export default function LiteBeta() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('form')
  const [form, setForm] = useState<FormData>({
    name: '', niche: '', instagram: '', hasActivePractice: '',
    currentOffers: '', instagramStatus: '', mainGoal: '', whyAccess: '', contact: '',
  })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})

  useEffect(() => {
    track('beta_start', { source: 'result' })
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
      name: true, niche: true, hasActivePractice: true, mainGoal: true, contact: true,
    }
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    track('beta_submit', { niche: form.niche, main_goal: form.mainGoal })

    fetch('/api/lite/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'beta', data: { ...form, submittedAt: new Date().toISOString() } }),
    }).catch(() => {/* silent */})

    setStage('success')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-black/8 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
        <div className="max-w-3xl mx-auto px-5 h-[52px] flex items-center justify-between">
          <button onClick={() => navigate('/lite')} className="text-[0.9375rem] fw-540 tracking-[-0.1px] cursor-pointer">
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
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Beta-доступ</p>
                <h1 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-2">
                  Заявка на тестування продукту
                </h1>
                <p className="type-body text-[rgba(0,0,0,0.55)] mb-8">
                  Beta-учасники отримують повний доступ до MVP і допомагають зробити продукт кращим.
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

                  {/* Name */}
                  <Field label="Ваше ім'я" error={touched.name ? errors.name : undefined}>
                    <input
                      type="text" value={form.name}
                      onChange={e => handleChange('name', e.target.value)}
                      onBlur={() => handleBlur('name')}
                      placeholder="Ім'я"
                      className={inputCls}
                    />
                  </Field>

                  {/* Niche */}
                  <Field label="Ваша ніша / спеціалізація" error={touched.niche ? errors.niche : undefined}>
                    <input
                      type="text" value={form.niche}
                      onChange={e => handleChange('niche', e.target.value)}
                      onBlur={() => handleBlur('niche')}
                      placeholder="Нутриціолог, health coach, косметолог..."
                      className={inputCls}
                    />
                  </Field>

                  {/* Instagram */}
                  <Field label={<>Instagram <Optional /></>}>
                    <input
                      type="text" value={form.instagram}
                      onChange={e => handleChange('instagram', e.target.value)}
                      placeholder="@yourhandle"
                      className={inputCls}
                    />
                  </Field>

                  {/* Has active practice */}
                  <Field label="Чи є у вас зараз активна практика?" error={touched.hasActivePractice ? errors.hasActivePractice : undefined}>
                    <div className="flex gap-3">
                      {['yes', 'no'].map(v => (
                        <label
                          key={v}
                          className={[
                            'flex-1 flex items-center justify-center h-10 rounded-[8px] border cursor-pointer transition-colors text-[0.9375rem] fw-330',
                            form.hasActivePractice === v
                              ? 'border-black/40 bg-black/[0.04]'
                              : 'border-black/15 hover:border-black/25',
                          ].join(' ')}
                        >
                          <input
                            type="radio" value={v} name="hasActivePractice"
                            className="sr-only"
                            onChange={() => handleChange('hasActivePractice', v)}
                          />
                          {v === 'yes' ? 'Так' : 'Ні / поки ні'}
                        </label>
                      ))}
                    </div>
                  </Field>

                  {/* Current offers */}
                  <Field label={<>Поточні послуги / офери <Optional /></>}>
                    <textarea
                      value={form.currentOffers}
                      onChange={e => handleChange('currentOffers', e.target.value)}
                      placeholder="Що ви зараз продаєте або збираєтеся продавати?"
                      rows={3}
                      className={textareaCls}
                    />
                  </Field>

                  {/* Instagram status */}
                  <Field label={<>Статус Instagram <Optional /></>}>
                    <select
                      value={form.instagramStatus}
                      onChange={e => handleChange('instagramStatus', e.target.value)}
                      className={[selectCls, !form.instagramStatus ? 'text-[rgba(0,0,0,0.3)]' : ''].join(' ')}
                    >
                      {INSTAGRAM_STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Main goal */}
                  <Field label="Головна ціль" error={touched.mainGoal ? errors.mainGoal : undefined}>
                    <select
                      value={form.mainGoal}
                      onChange={e => handleChange('mainGoal', e.target.value)}
                      onBlur={() => handleBlur('mainGoal')}
                      className={[selectCls, !form.mainGoal ? 'text-[rgba(0,0,0,0.3)]' : ''].join(' ')}
                    >
                      {MAIN_GOAL_OPTIONS.map(o => (
                        <option key={o.value} value={o.value} disabled={o.value === ''}>{o.label}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Why access */}
                  <Field label={<>Чому хочете отримати beta-доступ? <Optional /></>}>
                    <textarea
                      value={form.whyAccess}
                      onChange={e => handleChange('whyAccess', e.target.value)}
                      placeholder="Що саме хочете вирішити за допомогою Naukroom?"
                      rows={3}
                      maxLength={400}
                      className={textareaCls}
                    />
                  </Field>

                  {/* Contact */}
                  <Field label="Telegram або email для зв'язку" error={touched.contact ? errors.contact : undefined}>
                    <input
                      type="text" value={form.contact}
                      onChange={e => handleChange('contact', e.target.value)}
                      onBlur={() => handleBlur('contact')}
                      placeholder="@yourtelegram або email@example.com"
                      className={inputCls}
                    />
                  </Field>

                  <div className="flex flex-col gap-2 pt-1">
                    <Button type="submit" size="lg">Подати заявку на beta</Button>
                    <p className="text-center text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Ми розглядаємо заявки і зв'яжемося особисто.
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
                <div className="w-14 h-14 rounded-full bg-[oklch(0.52_0.24_285/0.1)] flex items-center justify-center">
                  <CheckCircle2 className="h-7 w-7 text-[oklch(0.52_0.24_285)]" />
                </div>
                <div>
                  <h2 className="text-[1.5rem] fw-400 tracking-[-0.5px] leading-[1.2] mb-2">
                    Заявку прийнято
                  </h2>
                  <p className="type-body text-[rgba(0,0,0,0.55)] max-w-[360px]">
                    Ми розглянемо вашу заявку і зв'яжемося особисто. Зазвичай - протягом 1–2 днів.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-[320px]">
                  <Button
                    size="lg"
                    onClick={() => {
                      track('telegram_join', { page: 'beta_success' })
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

// - helpers —

function Optional() {
  return <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
}

function Field({
  label,
  error,
  children,
}: {
  label: React.ReactNode
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">{label}</label>
      {children}
      {error && <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{error}</p>}
    </div>
  )
}

const inputCls =
  'h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]'

const textareaCls =
  'px-4 py-3 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors resize-none leading-[1.5] placeholder:text-[rgba(0,0,0,0.3)]'

const selectCls =
  'h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors bg-white appearance-none'
