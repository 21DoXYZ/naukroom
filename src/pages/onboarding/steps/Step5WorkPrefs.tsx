import { useFormContext } from 'react-hook-form'
import { Textarea } from '@/components/ui/Textarea'
import { type OnboardingData } from '../types'

export function Step5WorkPrefs() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Textarea
        label="З ким хочете працювати"
        rows={4}
        placeholder="Мотивовані жінки, які готові впроваджувати рекомендації. Клієнти з реальним запитом на зміну способу життя"
        hint="Опишіть характер, ситуацію, запит ідеального клієнта"
        {...register('idealClients')}
      />
      <Textarea
        label="З ким НЕ хочете працювати"
        rows={3}
        placeholder="Люди, які чекають швидкого результату без зусиль. Клієнти, які завжди знають краще"
        hint="Це допоможе правильно налаштувати контент і відбір клієнтів"
        {...register('avoidClients')}
      />
    </div>
  )
}
