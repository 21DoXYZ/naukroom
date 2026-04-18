import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { type OnboardingData } from '../types'

const workFormats = [
  { value: 'online', label: 'Онлайн' },
  { value: 'offline', label: 'Офлайн' },
  { value: 'mixed', label: 'Змішаний' },
]

export function Step1Identity() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<OnboardingData>()
  const current = watch('workFormat')

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Ваше ім'я"
        placeholder="Анна Соколова"
        error={(errors.name as { message?: string })?.message}
        {...register('name')}
      />
      <Input
        label="Професія / спеціалізація"
        placeholder="Нутриціолог, спеціаліст з харчування"
        hint="Як ви представляєтеся клієнтам"
        {...register('profession')}
      />
      <Input
        label="Поглиблена спеціалізація"
        placeholder="Схуднення для мам після пологів, спортивне харчування..."
        hint="В чому ви спеціалізуєтеся всередині своєї ніші"
        {...register('specialization')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Країна" placeholder="Україна" {...register('country')} />
        <Input label="Мова роботи" placeholder="Українська" {...register('language')} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[0.8125rem] fw-480 tracking-[-0.1px]">Формат роботи</p>
        <div className="flex gap-2">
          {workFormats.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setValue('workFormat', f.value as OnboardingData['workFormat'])}
              className={`flex-1 h-10 rounded-[8px] border text-[0.9375rem] fw-330 tracking-[-0.1px] transition-colors cursor-pointer ${
                current === f.value
                  ? 'border-black bg-black text-white'
                  : 'border-black/15 bg-white text-black hover:border-black/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
