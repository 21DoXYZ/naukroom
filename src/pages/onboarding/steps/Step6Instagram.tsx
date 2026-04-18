import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { type OnboardingData } from '../types'

export function Step6Instagram() {
  const { register } = useFormContext<OnboardingData>()
  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Посилання на Instagram профіль"
        placeholder="https://instagram.com/your_account"
        hint="Або просто @username"
        {...register('instagramUrl')}
      />
      <div className="rounded-[8px] border border-black/10 p-4">
        <p className="text-[0.8125rem] fw-540 tracking-[-0.1px] mb-2">Що ми проаналізуємо</p>
        <ul className="flex flex-col gap-1.5">
          {[
            'Шапку профілю (bio, ім\'я, опис)',
            'Аватар і візуальне перше враження',
            'Актуальне (highlights)',
            'Структуру і ясність позиціонування',
          ].map(item => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-black shrink-0" />
              <span className="type-body text-[rgba(0,0,0,0.7)]">{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[8px] bg-black/4 px-4 py-3">
        <p className="type-body text-[rgba(0,0,0,0.6)]">
          Якщо профілю немає — напишіть "немає" і ми дамо рекомендації з нуля.
        </p>
      </div>
    </div>
  )
}
