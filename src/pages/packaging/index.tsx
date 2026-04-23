import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'

interface ProfilePackaging {
  bioVariants: string[]
  highlightsStructure: Array<{ name: string; content: string[] }>
  pinnedPostConcepts: Array<{ title: string; hook: string; format: string; cta: string }>
  usernameIdeas: string[]
  profileNameVariants: string[]
  categoryRecommendation: string
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

function useSSEFetch<T>(path: string) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState('')
  useEffect(() => {
    async function fetch_() {
      try {
        await ssePost<T>(path, d => setData(d), e => setError(e))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Помилка підключення')
      }
    }
    fetch_()
  }, [path])
  return { data, error }
}

export default function ProfilePackaging() {
  const navigate = useNavigate()
  const { data: pkg, error } = useSSEFetch<ProfilePackaging>('/generate/profile-packaging')

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Помилка</p>
        <p className="type-body-lg mb-6">{error}</p>
        <Button onClick={() => navigate('/dashboard')}>До кабінету</Button>
      </div>
    </div>
  )

  if (!pkg) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
      <Spinner className="h-8 w-8 text-black" />
      <div className="text-center">
        <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Пакуємо профіль</p>
        <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Упаковка профілю</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Результат</p>
          <h1 className="type-display mb-3">Упаковка профілю</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{pkg.categoryRecommendation}</p>
        </motion.div>

        {/* Username + Name */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Варіанти username</p>
              {pkg.usernameIdeas.map((u, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-black/8 last:border-0">
                  <p className="type-mono-label">@{u}</p>
                  <CopyBtn text={`@${u}`} />
                </div>
              ))}
            </Card>
            <Card>
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Ім'я в профілі</p>
              {pkg.profileNameVariants.map((n, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-black/8 last:border-0">
                  <p className="text-[0.875rem] fw-450">{n}</p>
                  <CopyBtn text={n} />
                </div>
              ))}
            </Card>
          </div>
        </motion.div>

        {/* Bio variants */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={2} className="mb-6">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Варіанти Bio</p>
          <div className="flex flex-col gap-3">
            {pkg.bioVariants.map((bio, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)]">Варіант {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <span className={`type-mono-label ${bio.length > 150 ? 'text-red-500' : 'text-[rgba(0,0,0,0.3)]'}`}>{bio.length}/150</span>
                    <CopyBtn text={bio} />
                  </div>
                </div>
                <p className="text-[1rem] fw-330 leading-[1.55]">{bio}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Highlights */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={3} className="mb-6">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Структура Highlights</p>
            <div className="grid grid-cols-2 gap-4">
              {pkg.highlightsStructure.map((h, i) => (
                <div key={i} className="p-3 rounded-[6px] bg-black/[0.025] border border-black/8">
                  <p className="fw-480 text-[0.875rem] tracking-[-0.1px] mb-2">{h.name}</p>
                  <ul className="flex flex-col gap-1">
                    {h.content.map((c, j) => (
                      <li key={j} className="type-body text-[rgba(0,0,0,0.6)] flex gap-1.5">
                        <span className="text-[rgba(0,0,0,0.3)] shrink-0">·</span>{c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Pinned posts */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={4} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Закріплені пости</p>
          <div className="flex flex-col gap-3">
            {pkg.pinnedPostConcepts.map((p, i) => (
              <Card key={i}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="fw-480 text-[0.875rem] tracking-[-0.1px]">{p.title}</p>
                  <span className="type-mono-label text-[rgba(0,0,0,0.4)] shrink-0">{p.format}</span>
                </div>
                <p className="type-body text-black mb-1">"{p.hook}"</p>
                <p className="type-body text-[rgba(0,0,0,0.5)]">CTA: {p.cta}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={5}>
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
