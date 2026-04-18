import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[0.8125rem] fw-480 tracking-[-0.1px]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={clsx(
            'h-10 w-full rounded-[8px] border px-3 text-[0.9375rem] fw-330 tracking-[-0.1px] bg-white transition-colors',
            'placeholder:text-[rgba(0,0,0,0.35)]',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-black/15 focus:border-black/60',
            'outline-none',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 fw-330">{error}</p>}
        {hint && !error && <p className="text-xs text-[rgba(0,0,0,0.45)] fw-330">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
