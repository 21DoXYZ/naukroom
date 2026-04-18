import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Невірний формат email'),
  password: z.string().min(1, 'Введіть пароль'),
})
type FormData = z.infer<typeof schema>

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 280, damping: 28, delay: i * 0.07 },
  }),
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await login(data.email, data.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Помилка входу')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10 text-center">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Naukroom</p>
          <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-2">З поверненням</h1>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Увійдіть у свій акаунт</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          initial="hidden" animate="visible" variants={spring} custom={1}
        >
          <Input label="Email" type="email" placeholder="anna@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Пароль" type="password" placeholder="Ваш пароль" error={errors.password?.message} {...register('password')} />

          {serverError && <p className="text-sm text-red-500 fw-330">{serverError}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Входимо...' : 'Увійти'}
          </Button>
        </motion.form>

        <motion.p
          className="text-center type-body text-[rgba(0,0,0,0.5)] mt-6"
          initial="hidden" animate="visible" variants={spring} custom={2}
        >
          Ще немає акаунту?{' '}
          <Link to="/register" className="text-black fw-480 underline underline-offset-2">Зареєструватися</Link>
        </motion.p>
      </div>
    </div>
  )
}
