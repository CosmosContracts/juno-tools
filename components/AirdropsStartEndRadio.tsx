import { ChangeEventHandler, ReactNode } from 'react'

export interface AirdropsStartEndRadioProps {
  id: string
  htmlFor: 'start' | 'end'
  title: string
  subtitle: string
  checked: boolean
  onChange: ChangeEventHandler<HTMLInputElement> | undefined

  children?: ReactNode
}

const AirdropsStartEndRadio = (props: AirdropsStartEndRadioProps) => {
  const { id, htmlFor, title, subtitle, checked, onChange, children } = props
  return (
    <div className="flex space-x-4 w-full">
      {/* radio element */}
      <input
        id={`${htmlFor}-${id}`}
        name={`${htmlFor}-type`}
        type="radio"
        className="mt-1 w-4 h-4 text-plumbus focus:ring-plumbus cursor-pointer form-radio"
        onChange={onChange}
        checked={checked}
      />

      <div className="flex flex-col flex-grow space-y-2">
        {/* radio description */}
        <label htmlFor={`${htmlFor}-${id}`} className="group cursor-pointer">
          <span className="block font-bold group-hover:underline">{title}</span>
          <span className="block text-sm">{subtitle}</span>
        </label>

        {/* children if checked */}
        {checked ? children : null}
      </div>
    </div>
  )
}

export default AirdropsStartEndRadio
