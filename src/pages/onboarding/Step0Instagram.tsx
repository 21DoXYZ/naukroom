import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Instagram, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

interface InstagramData {
  username: string
  fullName: string
  bio: string
  isPrivate: boolean
  followers: number
}

interface PrefillResult {
  instagram: InstagramData
  prefill: Record<string, string>
}

interface Props {
  onComplete: (prefill: Record<string, string>) => void
  onSkip: () => void
}

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.07 },
  }),
}

export function Step0Instagram({ onComplete, onSkip }: Props) {
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PrefillResult | null>(null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function analyze() {
    const raw = handle.trim()
    if (!raw) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await api.post<PrefillResult>('/onboarding/analyze-instagram', { handle: raw })
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалось отримати профіль')
    } finally {
      setLoading(false)
    }
  }

  const filledCount = result ? Object.keys(result.prefill).filter(k => k !== 'instagramUrl').length : 0

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-black/8">
        <div className="max-w-2xl mx-auto px-6 h-[52px] flex items-center">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
        </div>
      </header>

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <motion.div variants={spring} initial="hidden" animate="visible" custom={0} className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/[0.04] border border-black/8 mb-5">
            <Instagram className="h-3.5 w-3.5 text-[rgba(0,0,0,0.5)]" />
            <span className="type-mono-label text-[rgba(0,0,0,0.5)]">Імпорт з Instagram</span>
          </div>
          <h1 className="text-[1.75rem] fw-400 tracking-[-0.6px] leading-[1.2] mb-3">
            Заощадимо час
          </h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.55)]">
            Введи свій Instagram — ми проаналізуємо профіль і пред-заповнимо поля онбордингу автоматично.
          </p>
        </motion.div>

        {!result && (
          <motion.div variants={spring} initial="hidden" animate="visible" custom={1}>
            <div className="flex gap-3 mb-4">
              <Input
                ref={inputRef}
                placeholder="@твій_нікнейм або посилання"
                value={handle}
                onChange={e => setHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && analyze()}
                className="flex-1"
                disabled={loading}
              />
              <Button onClick={analyze} disabled={loading || !handle.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Аналізувати'}
              </Button>
            </div>

            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-[rgba(0,0,0,0.45)] py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="type-body">Отримуємо дані з Instagram...</span>
              </motion.div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 p-3 rounded-[8px] bg-red-50 border border-red-100 mt-2">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="type-body text-red-600">{error}. Спробуй ще раз або пропусти цей крок.</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <div className="p-5 rounded-[12px] border border-black/10 bg-black/[0.015] mb-5">
              {result.instagram.isPrivate ? (
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-[rgba(0,0,0,0.4)] shrink-0 mt-0.5" />
                  <div>
                    <p className="fw-480 text-[0.9375rem] mb-1">@{result.instagram.username}</p>
                    <p className="type-body text-[rgba(0,0,0,0.55)]">Профіль приватний — bio недоступне. Заповнимо лише нікнейм.</p>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-4 w-4 text-black" />
                    <p className="fw-480 text-[0.9375rem]">
                      {result.instagram.fullName || `@${result.instagram.username}`}
                    </p>
                    {result.instagram.followers > 0 && (
                      <span className="type-mono-label text-[rgba(0,0,0,0.35)]">
                        {result.instagram.followers.toLocaleString('uk')} фоловерів
                      </span>
                    )}
                  </div>

                  {result.instagram.bio && (
                    <p className="type-body text-[rgba(0,0,0,0.6)] italic mb-4 pl-6">"{result.instagram.bio}"</p>
                  )}

                  {filledCount > 0 && (
                    <div className="pl-6">
                      <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Пред-заповнимо:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(result.prefill)
                          .filter(([k]) => k !== 'instagramUrl' && result.prefill[k])
                          .map(([key, val]) => (
                            <div key={key} className="px-2.5 py-1 rounded-[6px] bg-black/6 border border-black/8">
                              <span className="type-mono-label text-[rgba(0,0,0,0.5)]">{FIELD_LABELS[key] ?? key}: </span>
                              <span className="type-mono-label text-black">{String(val).slice(0, 40)}{String(val).length > 40 ? '…' : ''}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button size="lg" onClick={() => onComplete(result.prefill)}>
                {filledCount > 0 ? `Заповнити ${filledCount} поля →` : 'Продовжити →'}
              </Button>
              <button
                onClick={() => { setResult(null); setHandle('') }}
                className="type-mono-label text-[rgba(0,0,0,0.4)] hover:text-black transition-colors cursor-pointer"
              >
                Спробувати інший
              </button>
            </div>
          </motion.div>
        )}

        <div className="mt-8 pt-6 border-t border-black/8">
          <button
            onClick={onSkip}
            className="type-mono-label text-[rgba(0,0,0,0.35)] hover:text-black transition-colors cursor-pointer"
          >
            Пропустити — заповнити вручну →
          </button>
        </div>
      </div>
    </div>
  )
}

const FIELD_LABELS: Record<string, string> = {
  name: "Ім'я",
  profession: 'Професія',
  specialization: 'Спеціалізація',
  clientType: 'Клієнт',
  clientGenderAge: 'Вік/стать',
  currentServices: 'Послуги',
}
