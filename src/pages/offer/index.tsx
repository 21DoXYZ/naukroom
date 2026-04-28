import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { ssePost } from '@/lib/sse'
import { api } from '@/lib/api'

interface OfferItem {
  name: string
  description: string
  price: string
  format: string
  audience: string
  usp: string
}

interface OfferResult {
  coreOffer: OfferItem
  upsell: OfferItem
  downsell: OfferItem
  launchSequence: string[]
  pricingRationale: string
  salesPageHook: string
}

const spring = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring' as const, stiffness: 260, damping: 28, delay: i * 0.08 },
  }),
}

function OfferCard({ item, tier, index }: { item: OfferItem; tier: string; index: number }) {
  const [copied, setCopied] = useState(false)
  async function copyHook() {
    await navigator.clipboard.writeText(`${item.name}\n${item.description}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={spring} custom={index}>
      <Card className={tier === 'core' ? 'border-black/30 bg-black/[0.015]' : ''}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <span className="type-mono-label text-[rgba(0,0,0,0.4)]">{tier === 'core' ? 'Core офер' : tier === 'upsell' ? 'Upsell' : 'Downsell'}</span>
            <p className="text-[1.125rem] fw-480 tracking-[-0.2px] mt-0.5">{item.name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[1.25rem] fw-400 tracking-[-0.3px]">{item.price}</p>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)]">{item.format}</p>
          </div>
        </div>
        <p className="type-body text-[rgba(0,0,0,0.65)] mb-3">{item.description}</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Для кого</p>
            <p className="type-body text-[rgba(0,0,0,0.7)]">{item.audience}</p>
          </div>
          <div>
            <p className="type-mono-label text-[rgba(0,0,0,0.35)] mb-1">Унікальна перевага</p>
            <p className="type-body text-[rgba(0,0,0,0.7)]">{item.usp}</p>
          </div>
        </div>
        <button
          onClick={copyHook}
          className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? 'Скопійовано' : 'Скопіювати опис'}
        </button>
      </Card>
    </motion.div>
  )
}

export default function OfferBuilder() {
  const [offer, setOffer] = useState<OfferResult | null>(null)
  const [error, setError] = useState('')
  const [hookCopied, setHookCopied] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadOffer() }, [])

  async function loadOffer() {
    try {
      const cached = await api.get<{ result: OfferResult }>('/generate/output/offer')
      setOffer(cached.result)
    } catch {
      await generateOffer()
    }
  }

  async function generateOffer() {
    setOffer(null)
    setError('')
    try {
      await ssePost<OfferResult>('/generate/offer', setOffer, setError)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Помилка підключення')
    }
  }

  async function copyHook() {
    if (!offer?.salesPageHook) return
    await navigator.clipboard.writeText(offer.salesPageHook)
    setHookCopied(true)
    setTimeout(() => setHookCopied(false), 2000)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Помилка</p>
          <p className="type-body-lg mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>До кабінету</Button>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">
        <Spinner className="h-8 w-8 text-black" />
        <div className="text-center">
          <p className="text-[1rem] fw-450 tracking-[-0.1px] mb-1">Будуємо продуктову лінійку</p>
          <p className="type-body text-[rgba(0,0,0,0.5)]">Зазвичай займає 15–30 секунд</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-black/8">
        <div className="max-w-3xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <span className="text-[0.9375rem] fw-540 tracking-[-0.1px]">Naukroom</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.4)]">Офер і продуктова лінійка</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial="hidden" animate="visible" variants={spring} custom={0} className="mb-10">
          <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Ваш офер</p>
          <h1 className="type-display mb-3">Продуктова лінійка</h1>
          <p className="type-body-lg text-[rgba(0,0,0,0.6)]">{offer.pricingRationale}</p>
        </motion.div>

        {/* Sales hook */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={1} className="mb-8">
          <Card className="border-black/20 bg-black/[0.02]">
            <div className="flex items-start justify-between gap-4 mb-2">
              <p className="type-mono-label text-[rgba(0,0,0,0.4)]">Хук для продажів</p>
              <button
                onClick={copyHook}
                className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer shrink-0"
              >
                {hookCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {hookCopied ? 'Скопійовано' : 'Копіювати'}
              </button>
            </div>
            <p className="text-[1.25rem] fw-330 tracking-[-0.3px] leading-[1.4]">{offer.salesPageHook}</p>
          </Card>
        </motion.div>

        {/* Offer cards */}
        <div className="flex flex-col gap-4 mb-8">
          <OfferCard item={offer.coreOffer} tier="core" index={2} />
          <OfferCard item={offer.upsell} tier="upsell" index={3} />
          <OfferCard item={offer.downsell} tier="downsell" index={4} />
        </div>

        {/* Launch sequence */}
        <motion.div initial="hidden" animate="visible" variants={spring} custom={5} className="mb-10">
          <Card>
            <p className="type-mono-label text-[rgba(0,0,0,0.4)] mb-3">Послідовність запуску</p>
            <div className="flex flex-col gap-2">
              {offer.launchSequence.map((step, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-black/8 last:border-0">
                  <span className="type-mono-label text-[rgba(0,0,0,0.35)] mt-0.5 w-4 shrink-0">{i + 1}</span>
                  <p className="type-body">{step}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={spring} custom={6} className="flex items-center gap-3">
          <Button size="lg" onClick={() => navigate('/dashboard')}>
            До кабінету <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={generateOffer}>
            Перегенерувати
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
