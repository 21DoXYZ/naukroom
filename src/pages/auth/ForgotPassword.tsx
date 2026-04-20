import { useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) { setError('Вкажіть email'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/forgot-password', { email: email.trim() })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка. Спробуйте ще раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {sent ? (
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
              Перевірте пошту
            </h1>
            <p className="type-body text-[rgba(0,0,0,0.55)] mb-6">
              Якщо цей email зареєстровано - ми надіслали посилання для відновлення паролю.
            </p>
            <Link to="/login" className="text-[0.9375rem] fw-450 text-[rgba(0,0,0,0.5)] hover:text-black transition-colors">
              ← Повернутися до входу
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-8 text-center">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Naukroom</p>
              <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-2">Відновлення паролю</h1>
              <p className="type-body text-[rgba(0,0,0,0.5)]">Введіть email — надішлемо посилання</p>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
              initial="hidden" animate="visible" variants={spring} custom={1}
            >
              <Input
                label="Email"
                type="email"
                placeholder="anna@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              {error && <p className="text-sm text-[oklch(0.55_0.20_22)]">{error}</p>}
              <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                {loading ? 'Надсилаємо...' : 'Надіслати посилання'}
              </Button>
            </motion.form>

            <motion.p
              className="text-center type-body text-[rgba(0,0,0,0.5)] mt-6"
              initial="hidden" animate="visible" variants={spring} custom={2}
            >
              <Link to="/login" className="text-[rgba(0,0,0,0.4)] hover:text-black transition-colors">
                ← Повернутися до входу
              </Link>
            </motion.p>
          </>
        )}
      </div>
    </div>
  )
}
