import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'

const spring = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 28, delay: i * 0.07 },
  }),
}

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Пароль мінімум 6 символів'); return }
    if (password !== confirm) { setError('Паролі не збігаються'); return }
    if (!token) { setError('Невірне посилання для відновлення'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка. Посилання могло прострочитись.')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <p className="type-body text-[rgba(0,0,0,0.5)] mb-4">Невірне посилання для відновлення паролю.</p>
          <Link to="/forgot-password" className="text-black fw-480 underline underline-offset-2">
            Запросити знову
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {done ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="text-center"
          >
            <div className="w-14 h-14 rounded-full bg-[oklch(0.56_0.17_155/0.1)] flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="h-7 w-7 text-[oklch(0.56_0.17_155)]" />
            </div>
            <h1 className="text-[1.75rem] fw-400 tracking-[-0.7px] leading-[1.15] mb-2">
              Пароль змінено
            </h1>
            <p className="type-body text-[rgba(0,0,0,0.55)] mb-6">
              Тепер можна увійти з новим паролем.
            </p>
            <Button size="lg" onClick={() => navigate('/login')}>
              Увійти
            </Button>
          </motion.div>
        ) : (
          <>
            <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-8 text-center">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Naukroom</p>
              <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-2">Новий пароль</h1>
              <p className="type-body text-[rgba(0,0,0,0.5)]">Введіть новий пароль для вашого акаунту</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              initial="hidden" animate="visible" variants={spring} custom={1}
            >
              <Input
                label="Новий пароль"
                type="password"
                placeholder="Мінімум 6 символів"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <Input
                label="Підтвердіть пароль"
                type="password"
                placeholder="Повторіть пароль"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
              />
              {error && <p className="text-sm text-[oklch(0.55_0.20_22)]">{error}</p>}
              <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? 'Зберігаємо...' : 'Зберегти пароль'}
              </Button>
            </motion.form>
          </>
        )}
      </div>
    </div>
  )
}
