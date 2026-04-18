import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { type OnboardingData } from '../types'

export function Step3CurrentServices() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Textarea
        label="Що ви продаєте зараз"
        rows={4}
        placeholder={`Разові консультації\nСупровід на 3 місяці\nСкладання меню та раціону\nАналізи та розшифровка`}
        hint="Перерахуйте всі поточні послуги. Кожну з нового рядка"
        {...register('currentServices')}
      />
      <Input
        label="Поточні ціни"
        placeholder="Консультація — 1500 грн, супровід — 5000/міс"
        hint="Приблизний діапазон. Якщо немає — напишіть '0' або 'ще не продаю'"
        {...register('currentPrices')}
      />
    </div>
  )
}
