import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

interface AuditScore {
  category: string
  score: number
  label: string
  issue: string
  fix: string
}

interface ProfileAudit {
  overallScore: number
  summary: string
  scores: AuditScore[]
  bioVariants: string[]
  highlightsStructure: string[]
  pinnedPostIdeas: string[]
  quickWins: string[]
}

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.08 },
  }),
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 7 ? 'bg-black' : score >= 4 ? 'bg-black/50' : 'bg-black/20'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-black/8 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.3 }}
        />
      </div>
      <span className="type-mono-label text-[rgba(0,0,0,0.5)] w-4 text-right">{score}</span>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer shrink-0"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Скопійовано' : 'Копіювати'}
    </button>
  )
}

export default function ProfileAudit() {
  const [audit, setAudit] = useState<ProfileAudit | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchAudit() }, [])

  async function fetchAudit() {
    try {
      await ssePost<ProfileAudit>('/generate/profile-audit', setAudit, setError)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка підключення')
    }
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

  if (!audit) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <Spinner className="h-8 w-8 text-black" />
        <div className="text-center">
          <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Аналізуємо профіль</p>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
        </div>
      </div>
    )
  }

  const scoreColor = audit.overallScore >= 70 ? 'text-black' : audit.overallScore >= 40 ? 'text-black/60' : 'text-black/40'

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Аудит профілю</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Результати аудиту</p>
          <div className="flex items-end gap-4 mb-4">
            <h1 className="type-display">Аудит профілю</h1>
            <span className={`text-[2.5rem] fw-400 tracking-[-1px] leading-none mb-1 ${scoreColor}`}>
              {audit.overallScore}
            </span>
          </div>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{audit.summary}</p>
        </motion.div>

        {/* Score breakdown */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="mb-8">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Розбивка по категоріях</p>
            <div className="flex flex-col gap-4">
              {audit.scores.map((s, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[0.875rem] fw-480 tracking-[-0.1px]">{s.category}</p>
                    <span className={`type-mono-label px-2 py-0.5 rounded-[4px] ${
                      s.label === 'Добре' ? 'bg-black text-white' :
                      s.label === 'Потребує роботи' ? 'bg-black/8 text-black' :
                      'bg-black/5 text-[rgba(0,0,0,0.5)]'
                    }`}>{s.label}</span>
                  </div>
                  <ScoreBar score={s.score} />
                  <p className="type-body text-[rgba(0,0,0,0.5)] mt-1.5">{s.issue}</p>
                  <p className="type-body text-black mt-0.5">→ {s.fix}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick wins */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-6">
          <Card className="border-black/20 bg-black/[0.02]">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Швидкі перемоги</p>
            <div className="flex flex-col gap-2">
              {audit.quickWins.map((win, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <p className="type-body">{win}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Bio variants */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={3} className="mb-6">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Варіанти Bio</p>
          <div className="flex flex-col gap-3">
            {audit.bioVariants.map((bio, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)]">Варіант {i + 1}</span>
                  <CopyButton text={bio} />
                </div>
                <p className="text-[1rem] fw-330 tracking-[-0.1px] leading-[1.55]">{bio}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Highlights */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={4} className="mb-6">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Структура Highlights</p>
            <div className="flex flex-col gap-2">
              {audit.highlightsStructure.map((h, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <p className="type-body">{h}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Pinned posts */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={5} className="mb-10">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Закріплені пости</p>
            <div className="flex flex-col gap-2">
              {audit.pinnedPostIdeas.map((idea, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <ChevronRight className="h-3.5 w-3.5 text-[rgba(0,0,0,0.3)] mt-0.5 shrink-0" />
                  <p className="type-body">{idea}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={6}>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
