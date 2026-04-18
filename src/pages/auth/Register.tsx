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
  name: z.string().min(2, 'Мінімум 2 символи'),
  email: z.string().email('Невірний формат email'),
  password: z.string().min(6, 'Мінімум 6 символів'),
})
type FormData = z.infer<typeof schema>

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 280, damping: 28, delay: i * 0.07 },
  }),
}

export default function Register() {
  const { register: authRegister } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setServerError('')
    try {
      await authRegister(data.email, data.password, data.name)
      navigate('/onboarding')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Помилка реєстрації')
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10 text-center">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-4">Naukroom</p>
          <h1 className="text-[2rem] fw-400 tracking-[-0.8px] leading-[1.1] mb-2">Створити акаунт</h1>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Почніть будувати свою систему</p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          initial="hidden" animate="visible" variants={spring} custom={1}
        >
          <Input label="Ім'я" placeholder="Анна Соколова" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="anna@example.com" error={errors.email?.message} {...register('email')} />
          <Input label="Пароль" type="password" placeholder="Мінімум 6 символів" error={errors.password?.message} {...register('password')} />

          {serverError && <p className="text-sm text-red-500 fw-330">{serverError}</p>}

          <Button type="submit" size="lg" className="mt-2 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Створюємо...' : 'Зареєструватися'}
          </Button>
        </motion.form>

        <motion.p
          className="text-center type-body text-[rgba(0,0,0,0.5)] mt-6"
          initial="hidden" animate="visible" variants={spring} custom={2}
        >
          Вже є акаунт?{' '}
          <Link to="/login" className="text-black fw-480 underline underline-offset-2">Увійти</Link>
        </motion.p>
      </div>
    </div>
  )
}
