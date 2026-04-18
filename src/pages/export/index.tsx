import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Copy, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'

interface OutputItem {
  id: string
  type: string
  content: string
  status: string
  createdAt: number
}

const TYPE_LABEL: Record<string, string> = {
  positioning_summary: 'Позиціонування',
  profile_audit: 'Аудит профілю',
  offer: 'Офер і продуктова лінійка',
  profile_packaging: 'Упаковка профілю',
  lead_magnet: 'Лідмагніти',
  funnel: 'Воронка',
  content_pack: 'Контент-план',
}

const TYPE_ROUTE: Record<string, string> = {
  positioning_summary: '/onboarding/result',
  profile_audit: '/audit',
  offer: '/offer',
  profile_packaging: '/packaging',
  lead_magnet: '/lead-magnet',
  funnel: '/funnel',
  content_pack: '/content',
}

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.07 },
  }),
}

function CopyAllBtn({ outputs }: { outputs: OutputItem[] }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    const text = outputs.map(o => {
      const label = TYPE_LABEL[o.type] ?? o.type
      let content: string
      try {
        content = JSON.stringify(JSON.parse(o.content), null, 2)
      } catch {
        content = o.content
      }
      return `=== ${label} ===\n${content}`
    }).join('\n\n')
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }
  return (
    <Button variant="ghost" size="sm" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
      {copied ? 'Скопійовано' : 'Копіювати все'}
    </Button>
  )
}

function downloadJSON(outputs: OutputItem[]) {
  const pack: Record<string, unknown> = {}
  for (const o of outputs) {
    try { pack[o.type] = JSON.parse(o.content) } catch { pack[o.type] = o.content }
  }
  const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `naukroom-marketing-pack-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportPage() {
  const [outputs, setOutputs] = useState<OutputItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get<OutputItem[]>('/outputs')
      .then(setOutputs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const completedTypes = outputs.map(o => o.type)
  const allModules = Object.keys(TYPE_LABEL)
  const missingModules = allModules.filter(t => !completedTypes.includes(t))

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Маркетинг-пак</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Підсумок</p>
          <h1 className="type-display mb-3">Маркетинг-пак</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">
            Всі згенеровані матеріали в одному місці.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-6 w-6 text-black" /></div>
        ) : (
          <>
            {outputs.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="flex gap-3 mb-8">
                <Button onClick={() => downloadJSON(outputs)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Завантажити JSON
                </Button>
                <CopyAllBtn outputs={outputs} />
              </motion.div>
            )}

            {/* Completed modules */}
            {outputs.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-8">
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Готові матеріали</p>
                <div className="border border-black/10 rounded-[8px] overflow-hidden">
                  {outputs.map((o, i) => (
                    <div key={o.id} className={`flex items-center justify-between px-5 py-4 border-b border-black/8 last:border-0 ${i % 2 === 0 ? '' : 'bg-black/[0.008]'}`}>
                      <div>
                        <p className="fw-480 text-[0.875rem] tracking-[-0.1px]">{TYPE_LABEL[o.type] ?? o.type}</p>
                        <p className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5">
                          {new Date(o.createdAt).toLocaleDateString('uk')}
                          {o.status === 'approved' && ' · Схвалено'}
                        </p>
                      </div>
                      {TYPE_ROUTE[o.type] && (
                        <button
                          onClick={() => navigate(TYPE_ROUTE[o.type])}
                          className="flex items-center gap-1 type-mono-label text-[rgba(0,0,0,0.4)] hover:text-black transition-colors cursor-pointer"
                        >
                          Переглянути <ExternalLink className="h-3 w-3 ml-0.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Missing modules */}
            {missingModules.length > 0 && (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={3} className="mb-10">
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Ще не згенеровано</p>
                <div className="flex flex-col gap-2">
                  {missingModules.map(type => (
                    <div key={type} className="flex items-center justify-between px-5 py-3 rounded-[8px] border border-black/8 border-dashed">
                      <p className="type-body text-[rgba(0,0,0,0.45)]">{TYPE_LABEL[type]}</p>
                      {TYPE_ROUTE[type] && (
                        <Button variant="ghost" size="sm" onClick={() => navigate(TYPE_ROUTE[type])}>
                          Згенерувати
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {outputs.length === 0 && !loading && (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={2}>
                <Card className="text-center py-12">
                  <p className="type-body-lg text-[rgba(0,0,0,0.5)] mb-4">Поки немає згенерованих матеріалів</p>
                  <Button onClick={() => navigate('/dashboard')}>До кабінету</Button>
                </Card>
              </motion.div>
            )}
          </>
        )}

        {outputs.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={4}>
            <Button size="lg" variant="ghost" onClick={() => navigate('/dashboard')}>
              До кабінету <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
