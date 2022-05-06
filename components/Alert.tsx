import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { FaExclamationTriangle, FaInfoCircle, FaTimes } from 'react-icons/fa'
import type { IconType } from 'react-icons/lib'

export type AlertType = 'info' | 'warning' | 'error' | 'ghost'

const ALERT_ICONS_MAP: Record<AlertType, IconType | null> = {
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  error: FaTimes,
  ghost: null,
}

export interface AlertProps extends ComponentProps<'div'> {
  type?: AlertType
}

export const Alert = (props: AlertProps) => {
  const { type = 'info', className, children, ...rest } = props
  const AlertIcon = ALERT_ICONS_MAP[type]

  return (
    <div
      className={clsx(
        'flex relative p-4 space-x-4 border-l-4',
        { 'bg-blue-500/25 border-blue-500': type === 'info' },
        { 'bg-yellow-500/25 border-yellow-500': type === 'warning' },
        { 'bg-red-500/25 border-red-500': type === 'error' },
        { 'bg-stone-500/25 border-stone-500': type === 'ghost' },
        className,
      )}
      {...rest}
    >
      {AlertIcon && <AlertIcon size={24} />}
      <div className="flex flex-col flex-grow space-y-2">
        {children}
        {/*  */}
      </div>
    </div>
  )
}
