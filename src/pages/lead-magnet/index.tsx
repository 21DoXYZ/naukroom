import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'
import { api } from '@/lib/api'

interface LeadMagnetConcept {
  title: string
  format: string
  painItSolves: string
  deliverable: string
  distributionMethod: string
  cta: string
}

interface LeadMagnetResult {
  concepts: LeadMagnetConcept[]
  recommendedFirst: number
  distributionStrategy: string
  followUpSequence: string[]
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
      {copied ? 'Скопійовано' : 'Копіювати CTA'}
    </button>
  )
}

export default function LeadMagnetPage() {
  const [data, setData] = useState<LeadMagnetResult | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const cached = await api.get<{ result: LeadMagnetResult }>('/generate/output/lead_magnet')
      setData(cached.result)
    } catch { await generateData() }
  }

  async function generateData() {
    setData(null); setError('')
    try {
      await ssePost<LeadMagnetResult>('/generate/lead-magnets', setData, setError)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка підключення')
    }
  }

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
        <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Розробляємо лідмагніти</p>
        <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Лідмагніти</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Результат</p>
          <h1 className="type-display mb-3">Лідмагніти</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{data.distributionStrategy}</p>
        </motion.div>

        {/* Concepts */}
        <div className="flex flex-col gap-4 mb-8">
          {data.concepts.map((c, i) => (
            <motion.div key={i} initial="hidden" animate="visible" variants={spring} custom={i + 1}>
              <Card className={i === data.recommendedFirst ? 'border-black/30 bg-black/[0.015]' : ''}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    {i === data.recommendedFirst && (
                      <span className="type-mono-label px-2 py-0.5 bg-black text-white rounded-[4px] inline-block mb-1.5">Запустити першим</span>
                    )}
                    <p className="text-[1.125rem] fw-480 tracking-[-0.2px]">{c.title}</p>
                  </div>
                  <span className="type-mono-label text-[rgba(0,0,0,0.4)] shrink-0 mt-1">{c.format}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Яку біль вирішує</p>
                    <p className="type-body text-[rgba(0,0,0,0.7)]">{c.painItSolves}</p>
                  </div>
                  <div>
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Що отримає людина</p>
                    <p className="type-body text-[rgba(0,0,0,0.7)]">{c.deliverable}</p>
                  </div>
                </div>
                <p className="type-body text-[rgba(0,0,0,0.5)] mb-3">Де давати: {c.distributionMethod}</p>
                <div className="flex items-center justify-between gap-4 p-3 rounded-[6px] bg-black/[0.03] border border-black/8">
                  <p className="type-body italic text-black">"{c.cta}"</p>
                  <CopyBtn text={c.cta} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Follow-up sequence */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={data.concepts.length + 1} className="mb-10">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Follow-up послідовність</p>
            <div className="flex flex-col gap-2">
              {data.followUpSequence.map((msg, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <p className="type-body">{msg}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={data.concepts.length + 2} className="flex items-center gap-3">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={generateData}>Перегенерувати</Button>
        </motion.div>
      </div>
    </div>
  )
}
