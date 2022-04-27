import clsx from 'clsx'
import { ComponentProps, forwardRef } from 'react'
import { IconType } from 'react-icons/lib'

export interface WalletPanelButtonProps extends ComponentProps<'button'> {
  Icon: IconType
}

export const WalletPanelButton = forwardRef<
  HTMLButtonElement,
  WalletPanelButtonProps
>(function WalletPanelButton({ className, children, Icon, ...rest }, ref) {
  return (
    <button
      className={clsx(
        'flex items-center py-2 px-4 space-x-4 hover:bg-white/5',
        className
      )}
      {...rest}
      ref={ref}
    >
      <Icon />
      <span className="text-left">{children}</span>
    </button>
  )
})
