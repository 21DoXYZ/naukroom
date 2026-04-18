import * as RadixProgress from '@radix-ui/react-progress'
import { clsx } from 'clsx'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  label?: string
}

export function Progress({ value, max = 100, className, label }: ProgressProps) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={clsx('flex flex-col gap-1.5', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className="type-mono-label text-[rgba(0,0,0,0.45)]">{label}</span>
          <span className="type-mono-label text-[rgba(0,0,0,0.45)]">{value}/{max}</span>
        </div>
      )}
      <RadixProgress.Root
        value={pct}
        className="h-1 w-full rounded-full bg-black/8 overflow-hidden"
      >
        <RadixProgress.Indicator
          className="h-full bg-black rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </RadixProgress.Root>
    </div>
  )
}
