import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, FormProvider } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { type OnboardingData, TOTAL_STEPS, STEP_TITLES } from './types'
import { AnswerImprover } from './AnswerImprover'
import { Step0Instagram } from './Step0Instagram'
import { Step1Identity } from './steps/Step1Identity'
import { Step2Audience } from './steps/Step2Audience'
import { Step3CurrentServices } from './steps/Step3CurrentServices'
import { Step4TargetServices } from './steps/Step4TargetServices'
import { Step5WorkPrefs } from './steps/Step5WorkPrefs'
import { Step6Instagram } from './steps/Step6Instagram'
import { Step7Posts } from './steps/Step7Posts'
import { Step8Competitors } from './steps/Step8Competitors'
import { Step9Goals } from './steps/Step9Goals'

const STEPS = [
  Step1Identity, Step2Audience, Step3CurrentServices,
  Step4TargetServices, Step5WorkPrefs, Step6Instagram,
  Step7Posts, Step8Competitors, Step9Goals,
]

const IMPROVE_CONFIG: Record<number, { question: string; field: keyof OnboardingData }> = {
  2: { question: 'Головні болі вашої аудиторії', field: 'clientPains' },
  3: { question: 'Що ви продаєте зараз', field: 'currentServices' },
  5: { question: 'З ким хочете працювати', field: 'idealClients' },
}

const spring = {
  hidden: { opacity: 0, x: 20, filter: 'blur(4px)' },
  visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring' as const, stiffness: 280, damping: 28 } },
  exit: { opacity: 0, x: -16, filter: 'blur(2px)', transition: { duration: 0.18 } },
}

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [approvedSteps, setApprovedSteps] = useState<Set<number>>(new Set())
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  const methods = useForm<OnboardingData>({
    defaultValues: { workFormat: '', postScreenshots: [], goals: [], primaryGoal: '' },
  })

  useEffect(() => {
    api.get<Record<string, unknown>>('/onboarding/profile')
      .then(profile => {
        if (profile) {
          const savedStep = profile.currentStep as number | undefined
          methods.reset(profile as Partial<OnboardingData>)
          if (savedStep) setStep(savedStep)
          else setStep(0)
        }
      })
      .catch(() => {})
  }, [])

  function handlePrefill(prefill: Record<string, string>) {
    for (const [key, val] of Object.entries(prefill)) {
      if (val) methods.setValue(key as keyof OnboardingData, val as never)
    }
    setStep(1)
  }

  async function saveProgress(data: Partial<OnboardingData>) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { postScreenshots: _screenshots, ...safeData } = data as OnboardingData
    await api.post('/onboarding/profile', { ...safeData, currentStep: step })
  }

  async function next() {
    const data = methods.getValues()
    setSaving(true)
    try { await saveProgress(data) } catch { /* save errors are non-blocking — step advances regardless */ } finally { setSaving(false) }

    if (step < TOTAL_STEPS) {
      setStep(s => s + 1)
    } else {
      await finish(data)
    }
  }

  async function finish(data: OnboardingData) {
    setSaving(true)
    try {
      try { await saveProgress(data) } catch { /* non-blocking */ }
      await api.post('/onboarding/complete', {})
      navigate('/onboarding/result')
      refreshUser().catch(() => { /* background refresh, non-blocking */ })
    } finally {
      setSaving(false)
    }
  }

  const StepComponent = STEPS[step - 1]
  const improveConfig = IMPROVE_CONFIG[step]
  const improveAnswer = improveConfig ? methods.watch(improveConfig.field) as string : ''
  const isApproved = approvedSteps.has(step)

  if (step === 0) {
    return <Step0Instagram onComplete={handlePrefill} onSkip={() => setStep(1)} />
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-2xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Крок {step}/{TOTAL_STEPS}</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <Progress value={step} max={TOTAL_STEPS} className="mb-8" />

        <div className="flex items-start gap-2 px-3.5 py-2.5 rounded-[6px] bg-black/[0.025] border border-black/8 mb-8">
          <span className="type-mono-label text-[rgba(0,0,0,0.35)] shrink-0 mt-0.5">!</span>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Чим конкретніше ви описуєте свою аудиторію та послуги, тим точніший результат отримаєте.</p>
        </div>

        <AnimatePresence mode="sync">
          <motion.div key={step} variants={spring} initial="hidden" animate="visible" exit="exit">
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-2">Крок {step}</p>
            <h1 className="text-[1.75rem] fw-400 tracking-[-0.6px] leading-[1.15] mb-6">
              {STEP_TITLES[step - 1]}
            </h1>

            <FormProvider {...methods}>
              <StepComponent />
            </FormProvider>

            {improveConfig && improveAnswer && !isApproved && (
              <AnswerImprover
                question={improveConfig.question}
                answer={improveAnswer}
                onApprove={() => setApprovedSteps(s => new Set([...s, step]))}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-10 pt-6 border-t border-black/8">
          <Button variant="ghost" size="sm" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Назад
          </Button>
          <Button onClick={next} disabled={saving} size="md">
            {saving ? 'Зберігаємо...' : step === TOTAL_STEPS ? 'Завершити →' : 'Далі →'}
          </Button>
        </div>
      </div>
    </div>
  )
}
