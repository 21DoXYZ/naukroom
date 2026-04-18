import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { type OnboardingData } from '../types'

export function Step2Audience() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Тип клієнта"
        placeholder="Жінки після пологів, які хочуть схуднути без дієт"
        hint="Опишіть свого ідеального клієнта одним реченням"
        {...register('clientType')}
      />
      <Input
        label="Вік і стать"
        placeholder="Жінки 28–42 роки"
        {...register('clientGenderAge')}
      />
      <Textarea
        label="Головні болі вашої аудиторії"
        rows={4}
        placeholder={`Не знають з чого почати\nПробували дієти — не допомогло\nНемає часу на готування\nНе розуміють як поєднувати харчування з роботою`}
        hint="Перерахуйте 3–5 болів. Кожен з нового рядка або через кому"
        {...register('clientPains')}
      />
      <Textarea
        label="Якого результату хоче ваш клієнт"
        rows={3}
        placeholder="Схуднути на 10 кг за 3 місяці без жорстких обмежень, зберегти результат"
        hint="Конкретний бажаний результат, не процес"
        {...register('clientDesiredResults')}
      />
    </div>
  )
}
