import clsx from 'clsx'
import { ButtonHTMLAttributes, DetailedHTMLProps, forwardRef } from 'react'
import { BiWallet } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'

type BaseProps<T = HTMLButtonElement> = DetailedHTMLProps<
  ButtonHTMLAttributes<T>,
  T
>

export type WalletButtonProps = BaseProps & {
  isLoading?: boolean
}

export const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(
  function WalletButton({ className, children, isLoading, ...props }, ref) {
    return (
      <button
        className={clsx(
          'flex gap-x-2 items-center text-sm font-bold uppercase truncate', // content styling
          'py-2 px-4 rounded border border-plumbus', // button styling
          'hover:bg-white/10 transition-colors', // hover styling
          { 'cursor-wait': isLoading }, // loading styling
          className
        )}
        {...props}
        ref={ref}
      >
        {isLoading ? (
          <FaSpinner size={16} className="animate-spin" />
        ) : (
          <BiWallet size={16} />
        )}
        <span>{isLoading ? 'Loading...' : children}</span>
      </button>
    )
  }
)
