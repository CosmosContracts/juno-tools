import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import type { IconType } from 'react-icons/lib'

export interface WalletPanelButtonProps extends ComponentProps<'button'> {
  Icon: IconType
}

export const WalletPanelButton = forwardRef<HTMLButtonElement, WalletPanelButtonProps>(function WalletPanelButton(
  { className, children, Icon, ...rest },
  ref,
) {
  return (
    <button
      className={clsx('flex items-center py-2 px-4 space-x-4 hover:bg-white/5', className)}
      ref={ref}
      type="button"
      {...rest}
    >
      <Icon />
      <span className="text-left">{children}</span>
    </button>
  )
})
