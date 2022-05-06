import type { ReactNode } from 'react'

export interface FormGroupProps {
  title: string
  subtitle: ReactNode
  children?: ReactNode
}

export const FormGroup = (props: FormGroupProps) => {
  const { title, subtitle, children } = props

  return (
    <div className="flex p-4 space-x-4 w-full">
      <div className="flex flex-col w-1/3">
        <label className="flex flex-col space-y-1">
          <span className="font-bold">{title}</span>
          {subtitle && <span className="text-sm text-white/50">{subtitle}</span>}
        </label>
      </div>
      <div className="space-y-4 w-2/3">{children}</div>
    </div>
  )
}
