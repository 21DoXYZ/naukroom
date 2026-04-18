import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { type OnboardingData } from '../types'

export function Step4TargetServices() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Textarea
        label="Що хочете продавати в ідеалі"
        rows={5}
        placeholder={`Груповий марафон з харчування\nПреміум супровід 1-на-1\nОнлайн-курс\nПідписка на меню`}
        hint="Опишіть, що хочете продавати — навіть якщо цього поки немає. Кожну позицію з нового рядка"
        {...register('targetServices')}
      />
      <div className="rounded-[8px] bg-black/4 px-4 py-3">
        <p className="type-body text-[rgba(0,0,0,0.6)]">
          Якщо поки не знаєте — напишіть хоча б бажаний ціновий діапазон і формат роботи, який вам ближчий.
        </p>
      </div>
    </div>
  )
}
