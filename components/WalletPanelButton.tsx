import clsx from 'clsx'
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'
import { IconType } from 'react-icons/lib'

type BaseProps<T = HTMLButtonElement> = DetailedHTMLProps<
  ButtonHTMLAttributes<T>,
  T
>

export type WalletPanelButtonProps = BaseProps & {
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
