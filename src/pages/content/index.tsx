import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Copy, Check, ChevronDown, ChevronUp, Link } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

type ContentType = 'expert' | 'engaging' | 'selling' | 'pain' | 'objection'

interface ReelsScript {
  title: string
  contentType: ContentType
  relatedOffer: string
  leadMagnetLink: string
  painItCloses: string
  hook: string
  mainIdea: string
  scenes: string[]
  cta: string
  caption: string
  goal: string
  format: string
}

interface ContentConnectionMap {
  reelsTitle: string
  leadMagnet: string
  directCta: string
}

interface ContentPack {
  scripts: ReelsScript[]
  connectionMap: ContentConnectionMap[]
  contentCalendar: string
  hashtagSets: Array<{ theme: string; tags: string[] }>
}

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.06 },
  }),
}

const CONTENT_TYPE_LABEL: Record<ContentType, string> = {
  expert: 'Експертний',
  engaging: 'Залучальний',
  selling: 'Продаючий',
  pain: 'Через біль',
  objection: 'Через заперечення',
}

function CopyBtn({ text, label = 'Копіювати' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer shrink-0">
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Скопійовано' : label}
    </button>
  )
}

function ScriptCard({ script, index }: { script: ReelsScript; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const fullText = [
    `HOOK: ${script.hook}`,
    ``,
    script.scenes.map((s, i) => `${i + 1}. ${s}`).join('\n'),
    ``,
    `CTA: ${script.cta}`,
    ``,
    `---`,
    script.caption,
  ].join('\n')

  const typeLabel = CONTENT_TYPE_LABEL[script.contentType] ?? script.contentType

  return (
    <motion.div initial="hidden" animate="visible" variants={spring} custom={index + 1}>
      <Card>
        <button className="w-full flex items-start justify-between gap-4 cursor-pointer" onClick={() => setOpen(o => !o)}>
          <div className="text-left">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="type-mono-label text-[rgba(0,0,0,0.35)]">#{index + 1}</span>
              <span className="type-mono-label px-2 py-0.5 bg-black/6 rounded-[4px]">{typeLabel}</span>
              <span className="type-mono-label px-2 py-0.5 bg-black/5 rounded-[4px] text-[rgba(0,0,0,0.5)]">{script.format}</span>
              <span className="type-mono-label text-[rgba(0,0,0,0.35)]">{script.goal}</span>
            </div>
            <p className="fw-480 text-[0.9375rem] tracking-[-0.1px]">{script.title}</p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-[rgba(0,0,0,0.3)] shrink-0 mt-1" /> : <ChevronDown className="h-4 w-4 text-[rgba(0,0,0,0.3)] shrink-0 mt-1" />}
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
              <div className="pt-4 mt-4 border-t border-black/8">
                {/* Pain + lead magnet + offer */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-[6px] bg-black/[0.025] border border-black/8">
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Яку біль закриває</p>
                    <p className="type-body text-[rgba(0,0,0,0.7)]">{script.painItCloses}</p>
                  </div>
                  <div className="p-3 rounded-[6px] bg-black/[0.025] border border-black/8">
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Лід-магніт</p>
                    <p className="type-body text-[rgba(0,0,0,0.7)]">{script.leadMagnetLink}</p>
                  </div>
                </div>
                {script.relatedOffer && (
                  <div className="p-3 rounded-[6px] bg-black/[0.025] border border-black/8 mb-4">
                    <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Веде до офера</p>
                    <p className="type-body text-[rgba(0,0,0,0.7)]">{script.relatedOffer}</p>
                  </div>
                )}

                {/* Hook */}
                <div className="p-3 rounded-[6px] bg-black/[0.03] border border-black/8 mb-4">
                  <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-1">Hook (перші 3 сек)</p>
                  <p className="text-[1rem] fw-480 tracking-[-0.1px]">{script.hook}</p>
                </div>

                {/* Main idea */}
                <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Основна думка</p>
                <p className="type-body mb-4">{script.mainIdea}</p>

                {/* Scenes */}
                <div className="flex flex-col gap-2 mb-4">
                  {script.scenes.map((scene, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="type-mono-label text-[rgba(0,0,0,0.3)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                      <p className="type-body">{scene}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-[6px] bg-black/[0.025] border border-black/8 mb-3">
                  <div>
                    <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-0.5">CTA</p>
                    <p className="type-body italic">{script.cta}</p>
                  </div>
                </div>

                {/* Caption */}
                {script.caption && (
                  <div className="flex items-start justify-between gap-4 p-3 rounded-[6px] border border-black/8 mb-3">
                    <div className="flex-1">
                      <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-1">Caption</p>
                      <p className="type-body text-[rgba(0,0,0,0.7)]">{script.caption}</p>
                    </div>
                  </div>
                )}

                <CopyBtn text={fullText} label="Копіювати повний сценарій" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default function ContentPage() {
  const [data, setData] = useState<ContentPack | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    async function fetch_() {
      try {
        await ssePost<ContentPack>('/generate/content-pack', setData, setError)
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
        <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Пишемо сценарії Reels</p>
        <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 20–40 секунд</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Контент-план</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Результат</p>
          <h1 className="type-display mb-3">10 Reels-сценаріїв</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{data.contentCalendar}</p>
        </motion.div>

        {/* Scripts */}
        <div className="flex flex-col gap-3 mb-8">
          {data.scripts.map((s, i) => (
            <ScriptCard key={i} script={s} index={i} />
          ))}
        </div>

        {/* Connection map */}
        {data.connectionMap && data.connectionMap.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={data.scripts.length + 1} className="mb-8">
            <Card className="border-black/20 bg-black/[0.015]">
              <div className="flex items-center gap-2 mb-3">
                <Link className="h-3.5 w-3.5 text-black" />
                <p className="type-mono-label text-[rgba(0,0,0,0.5)]">Карта: контент → лід-магніт → Direct CTA</p>
              </div>
              <div className="border border-black/10 rounded-[6px] overflow-hidden">
                <div className="grid grid-cols-3 gap-4 px-4 py-2 bg-black/[0.03] border-b border-black/8">
                  {['Reels', 'Лід-магніт', 'Direct CTA'].map(h => (
                    <span key={h} className="type-mono-label text-[rgba(0,0,0,0.4)]">{h}</span>
                  ))}
                </div>
                {data.connectionMap.map((row, i) => (
                  <div key={i} className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-black/8 last:border-0">
                    <p className="type-body text-[0.8125rem]">{row.reelsTitle}</p>
                    <p className="type-body text-[0.8125rem] text-[rgba(0,0,0,0.6)]">{row.leadMagnet}</p>
                    <p className="type-body text-[0.8125rem] text-[rgba(0,0,0,0.6)]">{row.directCta}</p>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Hashtag sets */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={data.scripts.length + 2} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Набори хештегів</p>
          <div className="flex flex-col gap-3">
            {data.hashtagSets.map((set, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="fw-480 text-[0.875rem]">{set.theme}</p>
                  <CopyBtn text={set.tags.join(' ')} label="Копіювати хештеги" />
                </div>
                <p className="type-body text-[rgba(0,0,0,0.55)]">{set.tags.join(' ')}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={data.scripts.length + 3}>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
