import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'

export const StyledTextArea = forwardRef<HTMLTextAreaElement, ComponentProps<'textarea'>>(
  function Input({ className, ...rest }, ref) {
    return (
      <textarea
        className={clsx(
          'bg-white/10 rounded border-2 border-white/20 form-input',
          'placeholder:text-white/50',
          'focus:ring focus:ring-plumbus-20',
          className,
        )}
        ref={ref}
        {...rest}
      />
    )
  },
  //
)
