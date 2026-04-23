import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

interface Summary {
  whoYouAre: string
  coreOffer: string
  targetClient: string
  mainPain: string
  draftBio: string
  topProfileIssue: string
  nextSteps: string[]
}

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.1 },
  }),
}

export default function ValueMoment() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { fetchSummary() }, [])

  async function fetchSummary() {
    try {
      await ssePost<Summary>('/generate/positioning-summary', setSummary, setError)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка підключення')
    }
  }

  async function copyBio() {
    if (!summary?.draftBio) return
    await navigator.clipboard.writeText(summary.draftBio)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Помилка</p>
          <p className="type-body-lg mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>До кабінету</Button>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <Spinner className="h-8 w-8 text-black" />
        <div className="text-center">
          <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Аналізуємо ваш профіль</p>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Перші результати</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Готово</p>
          <h1 className="type-display mb-3">Ми вас зрозуміли</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">
            Ось перший погляд на ваше позиціонування. Далі буде повний маркетинг-пак.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Хто ви', value: summary.whoYouAre, i: 1 },
            { label: 'Ваш головний офер', value: summary.coreOffer, i: 2 },
            { label: 'Для кого', value: summary.targetClient, i: 3 },
            { label: 'Головний біль аудиторії', value: summary.mainPain, i: 4 },
          ].map(({ label, value, i }) => (
            <motion.div key={label} initial="hidden" animate="visible" variants={spring} custom={i}>
              <Card className="h-full">
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">{label}</p>
                <p className="type-subheading">{value}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={5} className="mb-4">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-3">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Чернетка Bio</p>
              <button
                onClick={copyBio}
                className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.5)] hover:text-black transition-colors cursor-pointer"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Скопійовано' : 'Скопіювати'}
              </button>
            </div>
            <p className="text-[1.125rem] fw-330 tracking-[-0.1px] leading-[1.55]">{summary.draftBio}</p>
            <p className={`type-mono-label mt-2 ${summary.draftBio.length > 150 ? 'text-red-500' : 'text-[rgba(0,0,0,0.3)]'}`}>{summary.draftBio.length}/150 символів</p>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={6} className="mb-8">
          <Card className="border-black/20 bg-black/[0.02]">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Головна проблема профілю</p>
            <p className="type-body-lg">{summary.topProfileIssue}</p>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={7} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Наступні кроки</p>
          <div className="flex flex-col gap-2">
            {summary.nextSteps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 py-3 border-b border-black/8 last:border-0">
                <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                <p className="type-body">{step}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={8}>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            Перейти до кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
