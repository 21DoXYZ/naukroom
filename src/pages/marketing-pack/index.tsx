import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Download, Copy, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

interface MarketingPackSection {
  title: string
  content: string
}

interface MarketingPack {
  expertName: string
  niche: string
  positioning: string
  coreBio: string
  coreOffer: string
  leadMagnet: string
  funnelOverview: string
  contentStrategy: string
  weekOneActions: string[]
  sections: MarketingPackSection[]
}

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.06 },
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
    <button onClick={copy} className="flex items-center gap-1 type-mono-label text-[rgba(0,0,0,0.35)] hover:text-black transition-colors cursor-pointer">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Скопійовано' : 'Копіювати'}
    </button>
  )
}

function Section({ title, content, index }: { title: string; content: string; index: number }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <motion.div
      initial="hidden" animate="visible" variants={spring} custom={index + 4}
      className="border border-black/10 rounded-[8px] overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-black/[0.02] transition-colors cursor-pointer"
        onClick={() => setOpen(o => !o)}
      >
        <span className="fw-480 text-[0.9375rem] tracking-[-0.1px]">{title}</span>
        <ChevronRight className={`h-4 w-4 text-[rgba(0,0,0,0.3)] transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-black/8">
              <div className="flex justify-end mt-3 mb-2">
                <CopyBtn text={content} />
              </div>
              <p className="type-body text-[rgba(0,0,0,0.75)] whitespace-pre-wrap leading-[1.7]">{content}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function downloadPack(pack: MarketingPack) {
  const lines = [
    `# Маркетинг-пак: ${pack.expertName}`,
    `Ніша: ${pack.niche}`,
    '',
    '## Позиціонування',
    pack.positioning,
    '',
    '## Bio для Instagram',
    pack.coreBio,
    '',
    '## Core Offer',
    pack.coreOffer,
    '',
    '## Лідмагніт',
    pack.leadMagnet,
    '',
    '## Воронка',
    pack.funnelOverview,
    '',
    '## Контент-стратегія',
    pack.contentStrategy,
    '',
    '## Тиждень 1 — дії',
    ...pack.weekOneActions.map((a, i) => `${i + 1}. ${a}`),
    '',
    ...pack.sections.flatMap(s => [`## ${s.title}`, s.content, '']),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `marketing-pack-${pack.expertName || Date.now()}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function MarketingPackPage() {
  const [pack, setPack] = useState<MarketingPack | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function generate() {
    setLoading(true)
    setError('')
    setPack(null)
    await ssePost<MarketingPack>(
      '/generate/marketing-pack',
      (result) => { setPack(result); setLoading(false) },
      (msg) => { setError(msg); setLoading(false) }
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <button onClick={() => navigate('/export')} className="type-mono-label text-[rgba(0,0,0,0.4)] hover:text-black transition-colors cursor-pointer">
            Всі матеріали
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Фінальний крок</p>
          <h1 className="type-display mb-3">Маркетинг-пак</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">
            Збираємо всі твої матеріали в єдиний готовий документ.
          </p>
        </motion.div>

        {!pack && !loading && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={1}>
            <Card className="text-center py-10">
              <p className="type-body text-[rgba(0,0,0,0.5)] mb-6 max-w-sm mx-auto">
                Щоб зібрати пак — спочатку пройди всі модулі: аудит, офер, упаковку, лідмагніти, воронку і контент.
              </p>
              <Button size="lg" onClick={generate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Зібрати Маркетинг-пак
              </Button>
            </Card>
          </motion.div>
        )}

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-20 gap-4">
            <Spinner className="h-7 w-7 text-black" />
            <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Збираємо пак...</p>
          </motion.div>
        )}

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="border-black/15">
              <p className="type-body text-[rgba(0,0,0,0.6)] mb-4">{error}</p>
              <Button variant="ghost" onClick={generate}>Спробувати ще раз</Button>
            </Card>
          </motion.div>
        )}

        {pack && (
          <>
            {/* Header summary */}
            <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="mb-8 p-6 rounded-[12px] border border-black/10 bg-black/[0.015]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-1">{pack.niche}</p>
                  <h2 className="text-[1.5rem] fw-400 tracking-[-0.5px]">{pack.expertName}</h2>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => downloadPack(pack)}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Завантажити
                  </Button>
                  <Button size="sm" onClick={generate} disabled={loading}>
                    Перегенерувати
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Позиціонування</p>
                  <p className="type-body">{pack.positioning}</p>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Bio</p>
                    <p className="type-body font-mono text-[0.875rem]">{pack.coreBio}</p>
                    <p className={`type-mono-label mt-1 ${pack.coreBio.length > 150 ? 'text-red-500' : 'text-[rgba(0,0,0,0.3)]'}`}>{pack.coreBio.length}/150</p>
                  </div>
                  <CopyBtn text={pack.coreBio} />
                </div>
              </div>
            </motion.div>

            {/* Week 1 actions */}
            <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-8">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Тиждень 1 — почни з цього</p>
              <div className="flex flex-col gap-2">
                {pack.weekOneActions.map((action, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3 rounded-[8px] bg-black/[0.02] border border-black/8">
                    <span className="type-mono-label text-[rgba(0,0,0,0.3)] shrink-0 mt-[2px]">{i + 1}</span>
                    <p className="type-body">{action}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key blocks */}
            <motion.div initial="hidden" animate="visible" variants={spring} custom={3} className="mb-8">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Ключові блоки</p>
              <div className="grid gap-3">
                {[
                  { label: 'Core Offer', value: pack.coreOffer },
                  { label: 'Лідмагніт', value: pack.leadMagnet },
                  { label: 'Воронка', value: pack.funnelOverview },
                  { label: 'Контент-стратегія', value: pack.contentStrategy },
                ].map(({ label, value }) => (
                  <Card key={label}>
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className="type-mono-label text-[rgba(0,0,0,0.4)]">{label}</p>
                      <CopyBtn text={value} />
                    </div>
                    <p className="type-body text-[rgba(0,0,0,0.75)]">{value}</p>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Full sections */}
            {pack.sections.length > 0 && (
              <div className="mb-10">
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Повні секції</p>
                <div className="flex flex-col gap-2">
                  {pack.sections.map((s, i) => (
                    <Section key={s.title} title={s.title} content={s.content} index={i} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
