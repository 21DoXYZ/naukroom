import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

interface FunnelStage {
  stage: string
  goal: string
  content: string
  timing: string
  template: string
}

interface FunnelResult {
  funnelName: string
  overview: string
  codeWord: string
  stages: FunnelStage[]
  reelHooks: string[]
  directScript: string
  followUp1: string
  followUp2: string
  liveExpertCondition: string
  objectionHandling: string[]
}

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.08 },
  }),
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer shrink-0">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Скопійовано' : 'Копіювати'}
    </button>
  )
}

export default function FunnelPage() {
  const [data, setData] = useState<FunnelResult | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetch_() {
      try {
        await ssePost<FunnelResult>('/generate/funnel', setData, setError)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка підключення')
      }
    }
    fetch_()
  }, [])

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Помилка</p>
        <p className="type-body-lg mb-6">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>До кабінету</Button>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
      <Spinner className="h-8 w-8 text-black" />
      <div className="text-center">
        <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Будуємо воронку</p>
        <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Воронка</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Результат</p>
          <h1 className="type-display mb-3">{data.funnelName}</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{data.overview}</p>
        </motion.div>

        {/* Code word highlight */}
        {data.codeWord && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="mb-8">
            <Card className="border-black/30 bg-black/[0.015]">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-4 w-4 text-black" />
                <p className="type-mono-label text-[rgba(0,0,0,0.5)]">Кодове слово</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <p className="text-[2rem] fw-400 tracking-[-0.8px]">{data.codeWord}</p>
                <CopyBtn text={data.codeWord} />
              </div>
              <p className="type-body text-[rgba(0,0,0,0.5)] mt-2">Підписники пишуть це слово в коментарях або Direct, щоб отримати лід-магніт</p>
            </Card>
          </motion.div>
        )}

        {/* Stages */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-8">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Етапи воронки</p>
          <div className="border border-black/10 rounded-[8px] overflow-hidden">
            {data.stages.map((s, i) => (
              <div key={i} className="p-5 border-b border-black/8 last:border-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="fw-480 text-[0.9375rem] tracking-[-0.1px]">{s.stage}</p>
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] shrink-0">{s.timing}</span>
                </div>
                <p className="type-body text-[rgba(0,0,0,0.5)] mb-2">{s.goal}</p>
                <p className="type-body mb-3">{s.content}</p>
                <div className="flex items-start justify-between gap-4 p-3 rounded-[6px] bg-black/[0.03] border border-black/8">
                  <p className="type-body italic text-black">"{s.template}"</p>
                  <CopyBtn text={s.template} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Reel hooks */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={3} className="mb-6">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Хуки для Reels (із кодовим словом)</p>
            <div className="flex flex-col gap-2">
              {data.reelHooks.map((hook, i) => (
                <div key={i} className="flex items-center justify-between gap-4 py-2.5 border-b border-black/8 last:border-0">
                  <p className="type-body">{hook}</p>
                  <CopyBtn text={hook} />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Follow-up sequence */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={4} className="mb-6">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Follow-up послідовність</p>
          <div className="flex flex-col gap-3">
            {[
              { label: 'Direct після лід-магніта', text: data.directScript },
              { label: 'Follow-up 1 (24-48 год)', text: data.followUp1 },
              { label: 'Follow-up 2 + CTA (3-4 дні)', text: data.followUp2 },
            ].map(({ label, text }, i) => (
              <Card key={i} className={i === 2 ? 'border-black/20 bg-black/[0.02]' : ''}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <p className="type-mono-label text-[rgba(0,0,0,0.4)]">{label}</p>
                  <CopyBtn text={text} />
                </div>
                <p className="type-body leading-[1.6]">{text}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Live expert condition */}
        {data.liveExpertCondition && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={5} className="mb-6">
            <Card className="border-black/15">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Коли підключати живого спеціаліста</p>
              <p className="type-body">{data.liveExpertCondition}</p>
            </Card>
          </motion.div>
        )}

        {/* Objection handling */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={6} className="mb-10">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Робота із запереченнями</p>
            <div className="flex flex-col gap-2">
              {data.objectionHandling.map((obj, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <p className="type-body">{obj}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={7}>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
