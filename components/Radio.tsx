import type { ChangeEventHandler, ReactNode } from 'react'

export interface RadioProps<T = string> {
  id: string
  htmlFor: T
  title: string
  subtitle: string
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement> | undefined
  selectSingle?: boolean

  children?: ReactNode
}

export const Radio = (props: RadioProps) => {
  const { id, htmlFor, title, subtitle, checked, onChange, children, selectSingle = false } = props
  return (
    <div className="flex space-x-4">
      {/* radio element */}
      <input
        checked={checked}
        className="mt-1 w-4 h-4 text-plumbus focus:ring-plumbus cursor-pointer form-radio"
        id={`${htmlFor}-${id}`}
        name={selectSingle ? id : htmlFor}
        onChange={onChange}
        type="radio"
      />

      <div className="flex flex-col flex-grow space-y-2">
        {/* radio description */}
        <label className="group cursor-pointer" htmlFor={`${htmlFor}-${id}`}>
          <span className="block font-bold group-hover:underline">{title}</span>
          <span className="block text-sm whitespace-pre-wrap">{subtitle}</span>
        </label>

        {/* children if checked */}
        {checked ? children : null}
      </div>
    </div>
  )
}
