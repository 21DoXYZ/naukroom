import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { track } from '@/lib/analytics'

interface FormData {
  profession: string
  bio: string
  instagramUrl: string
}

interface Errors {
  profession?: string
  bio?: string
  instagramUrl?: string
}

type Stage = 'form' | 'loading'

const LOADING_MESSAGES = [
  'Аналізуємо ваш Bio...',
  'Виявляємо слабкі місця позиціонування...',
  'Готуємо варіанти переписаного Bio...',
  'Формуємо рекомендації під вашу нішу...',
  'Збираємо аудит...',
]

function validate(data: FormData): Errors {
  const errors: Errors = {}
  if (!data.profession.trim() || data.profession.trim().length < 3) {
    errors.profession = 'Вкажіть вашу спеціалізацію'
  }
  if (!data.bio.trim() || data.bio.trim().length < 20) {
    errors.bio = 'Bio занадто коротке - мінімум 20 символів'
  }
  if (
    data.instagramUrl.trim() &&
    !/^https?:\/\/.+/.test(data.instagramUrl.trim()) &&
    !/^@/.test(data.instagramUrl.trim())
  ) {
    errors.instagramUrl = 'Вкажіть посилання або @handle'
  }
  return errors
}

export default function LiteTool() {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('form')
  const [loadingMsg, setLoadingMsg] = useState(0)
  const [form, setForm] = useState<FormData>({ profession: '', bio: '', instagramUrl: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const msgTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    track('tool_start')
    return () => {
      if (msgTimerRef.current) clearInterval(msgTimerRef.current)
    }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const allTouched = { profession: true, bio: true, instagramUrl: true }
    setTouched(allTouched)
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return

    track('input_submit', {
      bio_length: form.bio.trim().length,
      has_instagram_url: !!form.instagramUrl.trim(),
      profession: form.profession.trim(),
    })

    sessionStorage.setItem('lite_input', JSON.stringify(form))
    sessionStorage.removeItem('lite_result')
    setStage('loading')

    msgTimerRef.current = setInterval(() => {
      setLoadingMsg(i => (i + 1) % LOADING_MESSAGES.length)
    }, 1400)

    try {
      const res = await fetch('/api/lite/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profession: form.profession.trim(),
          bio: form.bio.trim(),
          instagramUrl: form.instagramUrl.trim(),
        }),
      })

      if (res.ok) {
        const audit = await res.json() as unknown
        sessionStorage.setItem('lite_result', JSON.stringify(audit))
        track('audit_generated', { profession: form.profession.trim() })
      }
    } catch {
      // Navigate anyway - result page handles missing data gracefully
    }

    if (msgTimerRef.current) clearInterval(msgTimerRef.current)
    navigate('/lite/result')
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
          <p className="type-mono-label text-[rgba(0,0,0,0.35)]">Крок 1 · 2</p>
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
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">AI-аудит профілю</p>
                <h1 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-2">
                  Розкажіть про ваш профіль
                </h1>
                <p className="type-body text-[rgba(0,0,0,0.55)] mb-8">
                  Чим конкретніше - тим точніший результат.
                </p>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Ваша спеціалізація
                    </label>
                    <input
                      type="text"
                      value={form.profession}
                      onChange={e => handleChange('profession', e.target.value)}
                      onBlur={() => handleBlur('profession')}
                      placeholder="Наприклад: нутриціолог, health coach, косметолог"
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                    {touched.profession && errors.profession && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.profession}</p>
                    )}
                    <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Чим конкретніше - тим точніший результат
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                        Ваше поточне Bio в Instagram
                      </label>
                      <span className="text-[0.75rem] text-[rgba(0,0,0,0.35)]">
                        {form.bio.length}/500
                      </span>
                    </div>
                    <textarea
                      value={form.bio}
                      onChange={e => handleChange('bio', e.target.value)}
                      onBlur={() => handleBlur('bio')}
                      placeholder="Вставте текст вашого Bio або опишіть, що ви зараз пишете у профілі"
                      maxLength={500}
                      rows={4}
                      className="px-4 py-3 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors resize-none leading-[1.5] placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                    {touched.bio && errors.bio && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.bio}</p>
                    )}
                    <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Скопіюйте Bio прямо з Instagram
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[0.875rem] fw-480 tracking-[-0.1px]">
                      Посилання на Instagram{' '}
                      <span className="fw-330 text-[rgba(0,0,0,0.4)]">(необов'язково)</span>
                    </label>
                    <input
                      type="text"
                      value={form.instagramUrl}
                      onChange={e => handleChange('instagramUrl', e.target.value)}
                      onBlur={() => handleBlur('instagramUrl')}
                      placeholder="https://instagram.com/yourprofile або @handle"
                      className="h-10 px-4 rounded-[8px] border border-black/15 text-[0.9375rem] fw-330 outline-none focus:border-black/40 transition-colors placeholder:text-[rgba(0,0,0,0.3)]"
                    />
                    {touched.instagramUrl && errors.instagramUrl && (
                      <p className="text-[0.8125rem] text-[oklch(0.55_0.20_22)]">{errors.instagramUrl}</p>
                    )}
                    <p className="text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Якщо профіль відкритий - аналіз буде точнішим
                    </p>
                  </div>

                  <div className="flex flex-col items-stretch gap-2 pt-1">
                    <Button type="submit" size="lg">
                      Отримати аудит →
                    </Button>
                    <p className="text-center text-[0.8125rem] text-[rgba(0,0,0,0.4)]">
                      Безкоштовно. Без реєстрації.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}

            {stage === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="flex flex-col items-center justify-center min-h-[320px] gap-8"
              >
                <div className="flex items-center gap-2">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-[oklch(0.52_0.24_285)]"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingMsg}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="text-[1rem] fw-400 tracking-[-0.1px] text-[rgba(0,0,0,0.7)]"
                  >
                    {LOADING_MESSAGES[loadingMsg]}
                  </motion.p>
                </AnimatePresence>

                <p className="type-mono-label text-[rgba(0,0,0,0.3)]">
                  Зазвичай займає 10-20 секунд
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
