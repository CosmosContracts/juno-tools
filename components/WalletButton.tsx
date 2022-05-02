import clsx from 'clsx'
import type { ComponentProps } from 'react'
import { forwardRef } from 'react'
import { BiWallet } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'

export interface WalletButtonProps extends ComponentProps<'button'> {
  isLoading?: boolean
}

export const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(function WalletButton(
  { className, children, isLoading, ...props },
  ref,
) {
  return (
    <button
      className={clsx(
        'flex gap-x-2 items-center text-sm font-bold uppercase truncate', // content styling
        'py-2 px-4 rounded border border-plumbus', // button styling
        'hover:bg-white/10 transition-colors', // hover styling
        { 'cursor-wait': isLoading }, // loading styling
        className,
      )}
      ref={ref}
      type="button"
      {...props}
    >
      {isLoading ? <FaSpinner className="animate-spin" size={16} /> : <BiWallet size={16} />}
      <span>{isLoading ? 'Loading...' : children}</span>
    </button>
  )
})
