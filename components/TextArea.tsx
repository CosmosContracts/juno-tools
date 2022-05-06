import clsx from 'clsx'
import type { ComponentProps } from 'react'

export const TextArea = (props: ComponentProps<'textarea'>) => {
  const { className, ...rest } = props
  return (
    <textarea
      className={clsx(
        'bg-white/10 rounded border-2 border-white/20 form-input',
        'placeholder:text-white/50',
        'focus:ring focus:ring-plumbus-20',
        className,
      )}
      {...rest}
    />
  )
}
