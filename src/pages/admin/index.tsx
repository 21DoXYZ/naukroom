import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface UserRow {
  id: string
  email: string
  name: string | null
  role: string
  onboardingStatus: string
  createdAt: number
}

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Не почав',
  in_progress: 'В процесі',
  completed: 'Завершено',
}

const spring = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.05 },
  }),
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.role !== 'admin') { navigate('/dashboard'); return }
    api.get<UserRow[]>('/admin/users').then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }, [user])

  const done = users.filter(u => u.onboardingStatus === 'completed').length
  const inProgress = users.filter(u => u.onboardingStatus === 'in_progress').length

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-5xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <div className="flex items-center gap-3">
            <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Адмін</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login') }}>Вийти</Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-8">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Панель управління</p>
          <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1]">Користувачі</h1>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Всього', value: users.length },
            { label: 'Завершили онбординг', value: done },
            { label: 'В процесі', value: inProgress },
          ].map(stat => (
            <Card key={stat.label} className="text-center">
              <p className="text-[2rem] fw-400 tracking-[-0.8px]">{stat.value}</p>
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mt-1">{stat.label}</p>
            </Card>
          ))}
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="h-6 w-6 text-black" /></div>
        ) : (
          <div className="border border-black/10 rounded-[8px] overflow-hidden">
            <div className="grid grid-cols-[1fr_1fr_140px_100px_80px] gap-4 px-5 py-2.5 bg-black/3 border-b border-black/10">
              {['Користувач', 'Email', 'Онбординг', 'Дата', ''].map(h => (
                <span key={h} className="type-mono-label text-[rgba(0,0,0,0.4)]">{h}</span>
              ))}
            </div>
            {users.map((u, i) => (
              <motion.div
                key={u.id}
                initial="hidden" animate="visible" variants={spring} custom={i + 2}
                className="grid grid-cols-[1fr_1fr_140px_100px_80px] gap-4 px-5 py-3.5 border-b border-black/8 last:border-0 items-center hover:bg-black/[0.015] transition-colors"
              >
                <p className="fw-480 text-[0.875rem] tracking-[-0.1px] truncate">{u.name ?? '—'}</p>
                <p className="type-body text-[rgba(0,0,0,0.6)] truncate">{u.email}</p>
                <span className={`type-mono-label px-2 py-1 rounded-[4px] w-fit ${
                  u.onboardingStatus === 'completed'
                    ? 'bg-black text-white'
                    : u.onboardingStatus === 'in_progress'
                    ? 'bg-black/8 text-black'
                    : 'text-[rgba(0,0,0,0.4)]'
                }`}>
                  {STATUS_LABEL[u.onboardingStatus] ?? u.onboardingStatus}
                </span>
                <p className="type-mono-label text-[rgba(0,0,0,0.4)]">
                  {new Date(u.createdAt).toLocaleDateString('uk')}
                </p>
                <Button variant="glass-dark" size="sm" onClick={() => navigate(`/admin/users/${u.id}`)}>
                  Відкрити
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
