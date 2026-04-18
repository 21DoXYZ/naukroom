import { useFormContext } from 'react-hook-form'
import { type OnboardingData, GOALS_OPTIONS } from '../types'

export function Step9Goals() {
  const { watch, setValue } = useFormContext<OnboardingData>()
  const selected = watch('goals') ?? []
  const primary = watch('primaryGoal')

  function toggle(goal: string) {
    if (selected.includes(goal)) {
      const next = selected.filter(g => g !== goal)
      setValue('goals', next)
      if (primary === goal) setValue('primaryGoal', '')
    } else {
      setValue('goals', [...selected, goal])
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[0.8125rem] fw-480 tracking-[-0.1px] mb-1">Виберіть цілі</p>
        <p className="type-body text-[rgba(0,0,0,0.5)] mb-4">Можна вибрати кілька</p>
        <div className="flex flex-col gap-2">
          {GOALS_OPTIONS.map(goal => (
            <button
              key={goal}
              type="button"
              onClick={() => toggle(goal)}
              className={`w-full text-left px-4 py-3 rounded-[8px] border fw-330 text-[0.9375rem] tracking-[-0.1px] transition-colors cursor-pointer ${
                selected.includes(goal)
                  ? 'border-black bg-black text-white'
                  : 'border-black/15 bg-white text-black hover:border-black/40'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
      {selected.length > 1 && (
        <div>
          <p className="text-[0.8125rem] fw-480 tracking-[-0.1px] mb-2">Яка ціль головна прямо зараз?</p>
          <div className="flex flex-col gap-2">
            {selected.map(goal => (
              <button
                key={goal}
                type="button"
                onClick={() => setValue('primaryGoal', goal)}
                className={`w-full text-left px-4 py-2.5 rounded-[8px] border fw-330 text-[0.9375rem] tracking-[-0.1px] transition-colors cursor-pointer ${
                  primary === goal ? 'border-black bg-black/6' : 'border-black/10 hover:border-black/25'
                }`}
              >
                {primary === goal ? '✓ ' : ''}{goal}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
