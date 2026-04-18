import { type ButtonHTMLAttributes } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { clsx } from 'clsx'

type Variant = 'solid' | 'white' | 'ghost' | 'glass-dark' | 'outline'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'variants'> &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>> & {
    variant?: Variant
    size?: Size
  }

const base = 'inline-flex items-center justify-center cursor-pointer fw-450 tracking-[-0.1px] transition-colors disabled:opacity-40 disabled:pointer-events-none rounded-[50px]'

const variants: Record<Variant, string> = {
  solid:       'bg-black text-white hover:bg-black/85',
  white:       'bg-white text-black hover:bg-white/90',
  ghost:       'bg-transparent text-black hover:bg-black/6',
  'glass-dark': 'bg-[rgba(0,0,0,0.07)] text-black hover:bg-[rgba(0,0,0,0.12)]',
  outline:     'border border-black/20 bg-transparent text-black hover:border-black/40',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-10 px-5 text-[0.9375rem]',
  lg: 'h-12 px-7 text-base',
}

export function Button({ variant = 'solid', size = 'md', className, ...props }: ButtonProps) {
  return (
    <motion.button
      className={clsx(base, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring' as const, stiffness: 400, damping: 20 }}
      {...props}
    />
  )
}
