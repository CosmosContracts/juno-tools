import clsx from 'clsx'
import { DetailedHTMLProps, TextareaHTMLAttributes } from 'react'

export type InputProps<T = HTMLTextAreaElement> = DetailedHTMLProps<
  TextareaHTMLAttributes<T>,
  T
>

const TextArea = ({ className, ...rest }: InputProps) => {
  return (
    <textarea
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

export default TextArea
