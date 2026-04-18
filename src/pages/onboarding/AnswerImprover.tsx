import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { api } from '@/lib/api'

interface Props {
  question: string
  answer: string
  onApprove: () => void
}

interface ImproveResult {
  quality: 'good' | 'needs_work' | 'too_vague'
  feedback: string
  suggestion: string
}

export function AnswerImprover({ question, answer, onApprove }: Props) {
  const [result, setResult] = useState<ImproveResult | null>(null)
  const [loading, setLoading] = useState(false)

  async function check() {
    if (!answer.trim() || loading) return
    setLoading(true)
    try {
      const r = await api.post<ImproveResult>('/generate/improve-answer', { question, answer })
      setResult(r)
    } catch {
      setResult({ quality: 'good', feedback: '', suggestion: '' })
    } finally {
      setLoading(false)
    }
  }

  if (!result && !loading) {
    return (
      <button
        type="button"
        onClick={check}
        className="flex items-center gap-1.5 type-mono-label text-[rgba(0,0,0,0.45)] hover:text-black transition-colors cursor-pointer mt-2"
      >
        <Sparkles className="h-3 w-3" />
        Перевірити відповідь
      </button>
    )
  }

  if (loading) {
    return <p className="type-mono-label text-[rgba(0,0,0,0.4)] mt-2 animate-pulse">Аналізуємо…</p>
  }

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 rounded-[8px] border border-black/10 p-4"
        >
          <div className="flex items-start gap-2.5">
            {result.quality === 'good'
              ? <CheckCircle className="h-4 w-4 text-black mt-0.5 shrink-0" />
              : <AlertCircle className="h-4 w-4 text-[rgba(0,0,0,0.5)] mt-0.5 shrink-0" />
            }
            <div className="flex-1">
              {result.feedback && <p className="type-body text-black mb-1">{result.feedback}</p>}
              {result.suggestion && result.quality !== 'good' && (
                <p className="type-body text-[rgba(0,0,0,0.5)] italic">Наприклад: {result.suggestion}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {result.quality === 'good' ? (
              <Button size="sm" onClick={onApprove}>Продовжити →</Button>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => setResult(null)}>Покращити</Button>
                <Button size="sm" variant="glass-dark" onClick={onApprove}>Залишити як є</Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
