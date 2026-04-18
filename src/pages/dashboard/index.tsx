import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, Lock, ChevronRight, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/lib/auth'

interface RoadmapStep {
  id: string
  label: string
  description: string
  status: 'done' | 'available' | 'locked'
  href?: string
}

const spring = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.07 },
  }),
}

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const onboardingDone = user?.onboardingStatus === 'completed'

  const steps: RoadmapStep[] = [
    {
      id: 'onboarding', label: 'Онбординг',
      description: 'Збір даних про вас, аудиторію, продукт і цілі',
      status: onboardingDone ? 'done' : 'available',
      href: '/onboarding',
    },
    {
      id: 'positioning', label: 'Позиціонування',
      description: 'Хто ви, для кого працюєте, у чому ваша цінність',
      status: onboardingDone ? 'done' : 'locked',
      href: '/onboarding/result',
    },
    {
      id: 'profile_audit', label: 'Аудит профілю',
      description: 'Аналіз Instagram-профілю — що працює, що ні',
      status: onboardingDone ? 'available' : 'locked',
      href: '/audit',
    },
    {
      id: 'offer', label: 'Офер і продуктова лінійка',
      description: 'Core offer, додаткові послуги, що просувати першим',
      status: onboardingDone ? 'available' : 'locked',
      href: '/offer',
    },
    {
      id: 'packaging', label: 'Упаковка профілю',
      description: '3 варіанти Bio, highlights, pinned posts',
      status: onboardingDone ? 'available' : 'locked',
      href: '/packaging',
    },
    {
      id: 'lead_magnet', label: 'Лідмагніти',
      description: '1–3 лідмагніти, прив\'язані до болів та оферу',
      status: onboardingDone ? 'available' : 'locked',
      href: '/lead-magnet',
    },
    {
      id: 'funnel', label: 'Воронка',
      description: 'Reels → Direct → follow-up → консультація',
      status: onboardingDone ? 'available' : 'locked',
      href: '/funnel',
    },
    {
      id: 'content', label: 'Контент-план',
      description: '10 Reels-сценаріїв з хуками, сценами та CTA',
      status: onboardingDone ? 'available' : 'locked',
      href: '/content',
    },
    {
      id: 'export', label: 'Маркетинг-пак',
      description: 'Підсумковий експорт усіх матеріалів',
      status: onboardingDone ? 'available' : 'locked',
      href: '/export',
    },
  ]

  const doneCount = steps.filter(s => s.status === 'done').length

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <div className="flex items-center gap-3">
            <span className="type-mono-label text-[rgba(0,0,0,0.4)]">{user?.name ?? user?.email}</span>
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/login') }}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Особистий кабінет</p>
          <h1 className="type-display mb-3">
            {user?.name ? `Привіт, ${user.name.split(' ')[0]}` : 'Кабінет'}
          </h1>
          <p className="type-body text-[rgba(0,0,0,0.55)]">
            Виконано {doneCount} з {steps.length} етапів
          </p>
        </motion.div>

        <div className="flex flex-col">
          {steps.map((s, i) => (
            <motion.div
              key={s.id}
              initial="hidden" animate="visible" variants={spring} custom={i + 1}
              className={`flex items-center gap-4 py-4 border-b border-black/8 last:border-0 ${
                s.status !== 'locked' && s.href ? 'cursor-pointer group' : ''
              }`}
              onClick={() => s.href && s.status !== 'locked' && navigate(s.href)}
            >
              <div className="shrink-0">
                {s.status === 'done' && <CheckCircle className="h-5 w-5 text-black" />}
                {s.status === 'available' && <Circle className="h-5 w-5 text-black" />}
                {s.status === 'locked' && <Lock className="h-4.5 w-4.5 text-[rgba(0,0,0,0.2)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[0.9375rem] fw-480 tracking-[-0.1px] ${s.status === 'locked' ? 'text-[rgba(0,0,0,0.35)]' : 'text-black'}`}>
                  {s.label}
                </p>
                <p className={`type-body mt-0.5 ${s.status === 'locked' ? 'text-[rgba(0,0,0,0.25)]' : 'text-[rgba(0,0,0,0.55)]'}`}>
                  {s.description}
                </p>
              </div>
              {s.status === 'available' && s.href && (
                <ChevronRight className="h-4 w-4 text-[rgba(0,0,0,0.3)] group-hover:text-black transition-colors shrink-0" />
              )}
              {s.status === 'done' && s.href && (
                <span className="type-mono-label text-[rgba(0,0,0,0.35)] shrink-0">Готово</span>
              )}
            </motion.div>
          ))}
        </div>

        {!onboardingDone && (
          <motion.div initial="hidden" animate="visible" variants={spring} custom={steps.length + 1} className="mt-8">
            <Button size="lg" onClick={() => navigate('/onboarding')}>
              Почати онбординг <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
