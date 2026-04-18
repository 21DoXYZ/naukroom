import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { type OnboardingData } from '../types'

export function Step8Competitors() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Textarea
        label="3–5 конкурентів або орієнтирів"
        rows={5}
        placeholder={`@nutritionist_example\nhttps://instagram.com/expert_name\nАнна Іванова — нутриціолог (Київ)`}
        hint="Посилання або @username. Можна додати імена без посилань"
        {...register('competitors')}
      />
      <div className="rounded-[8px] bg-black/4 px-4 py-3">
        <p className="text-[0.8125rem] fw-540 tracking-[-0.1px] mb-1.5">Навіщо це потрібно</p>
        <p className="type-body text-[rgba(0,0,0,0.6)]">
          Ми проаналізуємо, чим вони виділяються, що працює в їхній упаковці,
          і допоможемо позиціонувати вас відмінно від них — не копіювати, а знайти свою нішу.
        </p>
      </div>
    </div>
  )
}
