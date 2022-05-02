import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

export interface FormControlProps extends ComponentProps<'div'> {
  title: string
  subtitle?: ReactNode
  htmlId?: string
  isRequired?: boolean
}

export const FormControl = (props: FormControlProps) => {
  const { title, subtitle, htmlId, isRequired, children, className, ...rest } = props

  return (
    <div className={clsx('flex flex-col space-y-2', className)} {...rest}>
      <label className="flex flex-col space-y-1" htmlFor={htmlId}>
        <span
          className={clsx('font-bold', {
            "after:text-red-500 after:content-['_*']": isRequired,
          })}
        >
          {title}
        </span>
        {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
      </label>
      {children}
    </div>
  )
}
