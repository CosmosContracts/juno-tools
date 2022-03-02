import clsx from 'clsx'
import { DetailedHTMLProps, InputHTMLAttributes } from 'react'

export type InputProps<T = HTMLInputElement> = DetailedHTMLProps<
  InputHTMLAttributes<T>,
  T
>

const Input = ({ className, ...rest }: InputProps) => {
  return (
    <input
      className={clsx(
        'bg-white/10 rounded border-2 border-white/20 form-input',
        'placeholder:text-white/50',
        'focus:ring focus:ring-plumbus-20',
        className
      )}
      {...rest}
    />
  )
}

export default Input
