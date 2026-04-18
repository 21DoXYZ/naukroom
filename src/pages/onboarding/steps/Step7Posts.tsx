import { useFormContext } from 'react-hook-form'
import { ImagePlus, X } from 'lucide-react'
import { type OnboardingData } from '../types'

export function Step7Posts() {
  const { watch, setValue } = useFormContext<OnboardingData>()
  const screenshots = watch('postScreenshots') ?? []

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const readers = files.map(
      file =>
        new Promise<string>(resolve => {
          const reader = new FileReader()
          reader.onload = ev => resolve(ev.target?.result as string)
          reader.readAsDataURL(file)
        })
    )
    Promise.all(readers).then(results => {
      setValue('postScreenshots', [...screenshots, ...results].slice(0, 9))
    })
  }

  function remove(i: number) {
    setValue('postScreenshots', screenshots.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-[0.8125rem] fw-480 tracking-[-0.1px] mb-1.5">Скріншоти останніх постів</p>
        <p className="type-body text-[rgba(0,0,0,0.5)] mb-4">
          Завантажте сітку з 9 останніх постів або окремі скріншоти (до 9 штук)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {screenshots.map((src, i) => (
            <div key={i} className="relative aspect-square rounded-[6px] overflow-hidden bg-black/5">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {screenshots.length < 9 && (
            <label className="aspect-square rounded-[6px] border-2 border-dashed border-black/15 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors">
              <ImagePlus className="h-5 w-5 text-[rgba(0,0,0,0.35)] mb-1" />
              <span className="type-mono-label text-[rgba(0,0,0,0.35)]">Додати</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
          )}
        </div>
      </div>
      {screenshots.length === 0 && (
        <div className="rounded-[8px] bg-black/4 px-4 py-3">
          <p className="type-body text-[rgba(0,0,0,0.6)]">
            Якщо постів немає — пропустіть цей крок. Ми дамо рекомендації з контент-плану з нуля.
          </p>
        </div>
      )}
    </div>
  )
}
