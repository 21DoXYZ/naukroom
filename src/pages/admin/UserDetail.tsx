import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Check, AlertCircle, Clock, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { api } from '@/lib/api'

interface UserRow {
  id: string
  email: string
  name: string | null
  role: string
  onboardingStatus: string
  createdAt: number
}

interface QAResult {
  score: number
  passed: boolean
  issues: string[]
  rewrittenFields: Record<string, string>
}

interface Output {
  id: string
  type: string
  content: string
  qaScore: string | null
  status: string
  adminNotes: string | null
  createdAt: number
}

interface UserDetail {
  user: UserRow
  profile: Record<string, unknown> | null
  outputs: Output[]
}

const TYPE_LABEL: Record<string, string> = {
  positioning_summary: 'Позиціонування',
  profile_audit: 'Аудит профілю',
  offer: 'Офер',
  profile_packaging: 'Упаковка профілю',
  lead_magnet: 'Лідмагніти',
  funnel: 'Воронка',
  content_pack: 'Контент-план',
  marketing_pack: 'Маркетинг-пак',
}

const STATUS_CONFIG = {
  pending: { label: 'Очікує', icon: Clock, bg: 'bg-black/8 text-black' },
  approved: { label: 'Схвалено', icon: Check, bg: 'bg-black text-white' },
  needs_review: { label: 'На перегляд', icon: AlertCircle, bg: 'bg-black/20 text-black' },
}

const spring = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.05 },
  }),
}

function qaColor(score: number) {
  if (score >= 80) return 'text-black bg-black/8'
  if (score >= 65) return 'text-black bg-black/15'
  return 'text-white bg-black'
}

function QABadge({ qa }: { qa: QAResult }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] type-mono-label ${qaColor(qa.score)}`}>
      {qa.passed
        ? <ShieldCheck className="h-3 w-3" />
        : <ShieldAlert className="h-3 w-3" />
      }
      QA {qa.score}/100
    </div>
  )
}

function QADetails({ qa }: { qa: QAResult }) {
  if (qa.passed && qa.issues.length === 0) return null
  return (
    <div className="mb-4 rounded-[6px] border border-black/10 p-3">
      <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">
        {qa.passed ? 'Пройшов QA' : 'Не пройшов QA'} — {qa.score}/100
      </p>
      {qa.issues.length > 0 && (
        <ul className="flex flex-col gap-1 mb-3">
          {qa.issues.map((issue, i) => (
            <li key={i} className="type-mono-label text-[rgba(0,0,0,0.6)] flex gap-1.5">
              <span className="shrink-0 mt-[1px]">·</span>
              {issue}
            </li>
          ))}
        </ul>
      )}
      {Object.keys(qa.rewrittenFields).length > 0 && (
        <div className="border-t border-black/8 pt-3">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Перероблені поля</p>
          {Object.entries(qa.rewrittenFields).map(([field, value]) => (
            <div key={field} className="mb-2">
              <p className="type-mono-label text-[rgba(0,0,0,0.35)]">{field}</p>
              <p className="type-body text-[rgba(0,0,0,0.75)]">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OutputCard({ output, onUpdate, onRegenerated }: {
  output: Output
  onUpdate: (id: string, status: string, notes: string) => void
  onRegenerated: (updated: Output) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(output.adminNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const cfg = STATUS_CONFIG[output.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending

  let qa: QAResult | null = null
  try { if (output.qaScore) qa = JSON.parse(output.qaScore) } catch { /* skip */ }

  async function save(status: string) {
    setSaving(true)
    try {
      await api.patch(`/admin/outputs/${output.id}`, { status, adminNotes: notes })
      onUpdate(output.id, status, notes)
    } finally {
      setSaving(false)
    }
  }

  async function regenerate() {
    if (!confirm(`Перегенерувати "${TYPE_LABEL[output.type] ?? output.type}"? Поточний контент буде замінено.`)) return
    setRegenerating(true)
    try {
      const res = await api.post<{ ok: boolean; output: Output }>(`/admin/outputs/${output.id}/regenerate`, {})
      if (res.output) {
        setNotes(res.output.adminNotes ?? '')
        onRegenerated(res.output)
      }
    } catch {
      alert('Помилка регенерації. Спробуйте ще раз.')
    } finally {
      setRegenerating(false)
    }
  }

  let parsedContent: unknown = null
  try { parsedContent = JSON.parse(output.content) } catch { /* raw string */ }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <p className="fw-480 text-[0.875rem] tracking-[-0.1px]">{TYPE_LABEL[output.type] ?? output.type}</p>
          <p className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5">
            {new Date(output.createdAt).toLocaleDateString('uk')}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {qa && <QABadge qa={qa} />}
          <span className={`type-mono-label px-2 py-0.5 rounded-[4px] flex items-center gap-1 ${cfg.bg}`}>
            <cfg.icon className="h-3 w-3" />
            {cfg.label}
          </span>
          <Button variant="ghost" size="sm" onClick={regenerate} disabled={regenerating} title="Перегенерувати">
            <RefreshCw className={`h-3.5 w-3.5 ${regenerating ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Закрити' : 'Розгорнути'}
          </Button>
        </div>
      </div>

      {expanded && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-black/8 pt-4 mt-2">
          {qa && <QADetails qa={qa} />}

          <div className="bg-black/[0.025] rounded-[6px] p-4 mb-4 max-h-64 overflow-y-auto">
            <pre className="text-[0.75rem] leading-[1.6] whitespace-pre-wrap break-all text-[rgba(0,0,0,0.7)] font-mono">
              {parsedContent ? JSON.stringify(parsedContent, null, 2) : output.content}
            </pre>
          </div>

          <div className="mb-4">
            <label className="type-mono-label text-[rgba(0,0,0,0.4)] block mb-2">Нотатки адміна</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Додати нотатку..."
              className="w-full min-h-[80px] resize-y rounded-[6px] border border-black/15 px-3 py-2.5 text-[0.875rem] leading-[1.5] focus:outline-none focus:border-black/40 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={() => save('approved')} disabled={saving}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Схвалити
            </Button>
            <Button size="sm" variant="glass-dark" onClick={() => save('needs_review')} disabled={saving}>
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              На перегляд
            </Button>
            <Button size="sm" variant="ghost" onClick={() => save('pending')} disabled={saving}>
              Очікує
            </Button>
          </div>
        </motion.div>
      )}
    </Card>
  )
}

export default function AdminUserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    api.get<UserDetail>(`/admin/users/${id}`)
      .then(setDetail)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function handleOutputUpdate(outputId: string, status: string, notes: string) {
    setDetail(d => d ? {
      ...d,
      outputs: d.outputs.map(o => o.id === outputId ? { ...o, status, adminNotes: notes } : o),
    } : null)
  }

  function handleRegenerated(updated: Output) {
    setDetail(d => d ? {
      ...d,
      outputs: d.outputs.map(o => o.id === updated.id ? updated : o),
    } : null)
  }

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Spinner className="h-6 w-6 text-black" />
    </div>
  )

  if (!detail) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="type-body">Користувача не знайдено</p>
    </div>
  )

  const { user, profile, outputs } = detail

  const avgQA = (() => {
    const withQA = outputs.filter(o => o.qaScore)
    if (!withQA.length) return null
    const total = withQA.reduce((sum, o) => {
      try {
        const qa = JSON.parse(o.qaScore!) as QAResult
        return typeof qa.score === 'number' ? sum + qa.score : sum
      } catch { return sum }
    }, 0)
    return Math.round(total / withQA.length)
  })()

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="flex items-center gap-1 type-mono-label text-[rgba(0,0,0,0.4)] hover:text-black transition-colors cursor-pointer">
            <ChevronLeft className="h-3.5 w-3.5" />
            Назад
          </button>
          <span className="text-[rgba(0,0,0,0.2)]">/</span>
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-8">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Профіль користувача</p>
          <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-1">
            {user.name ?? user.email}
          </h1>
          {user.name && <p className="type-body text-[rgba(0,0,0,0.5)]">{user.email}</p>}
        </motion.div>

        <div className="grid md:grid-cols-[1fr_2fr] gap-6">
          <div className="flex flex-col gap-4">
            <motion.div initial="hidden" animate="visible" variants={spring} custom={1}>
              <Card>
                <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Акаунт</p>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'Роль', value: user.role },
                    { label: 'Онбординг', value: user.onboardingStatus },
                    { label: 'Матеріалів', value: String(outputs.length) },
                    ...(avgQA !== null ? [{ label: 'Середній QA', value: `${avgQA}/100` }] : []),
                    { label: 'Дата реєстрації', value: new Date(user.createdAt).toLocaleDateString('uk') },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-black/8 last:border-0">
                      <span className="type-mono-label text-[rgba(0,0,0,0.4)]">{label}</span>
                      <span className="type-mono-label">{value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {profile && (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={2}>
                <Card>
                  <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Дані з онбордингу</p>
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                    {Object.entries(profile)
                      .filter(([k]) => !['id', 'userId', 'updatedAt', 'currentStep'].includes(k))
                      .map(([key, value]) => value ? (
                        <div key={key}>
                          <p className="type-mono-label text-[rgba(0,0,0,0.35)]">{key}</p>
                          <p className="type-body text-[rgba(0,0,0,0.7)] mb-1">
                            {Array.isArray(value) ? (value as string[]).join(', ') : String(value)}
                          </p>
                        </div>
                      ) : null)
                    }
                  </div>
                </Card>
              </motion.div>
            )}
          </div>

          <div>
            <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-4">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">
                Згенеровані матеріали ({outputs.length})
              </p>
            </motion.div>
            {outputs.length === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={spring} custom={3}>
                <p className="type-body text-[rgba(0,0,0,0.4)]">Ще немає матеріалів</p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3">
                {outputs.map((o, i) => (
                  <motion.div key={o.id} initial="hidden" animate="visible" variants={spring} custom={i + 3}>
                    <OutputCard output={o} onUpdate={handleOutputUpdate} onRegenerated={handleRegenerated} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
