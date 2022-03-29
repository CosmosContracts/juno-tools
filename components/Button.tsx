import clsx from 'clsx'
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react'
import { CgSpinnerAlt } from 'react-icons/cg'

export type ButtonVariant = 'solid' | 'outline'

type BaseProps<T = HTMLButtonElement> = DetailedHTMLProps<
  ButtonHTMLAttributes<T>,
  T
>

export interface ButtonProps extends BaseProps {
  isDisabled?: boolean
  isLoading?: boolean
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  variant?: ButtonVariant
}

const Button = (props: ButtonProps) => {
  const {
    isDisabled,
    isLoading,
    leftIcon,
    rightIcon,
    variant = 'solid',
    className,
    children,
    ...rest
  } = props

  return (
    <button
      className={clsx(
        'group flex items-center py-2 px-4 space-x-2 font-bold focus:ring',
        {
          'bg-plumbus-60 hover:bg-plumbus-50 rounded ': variant == 'solid',
          'bg-plumbus/10 hover:bg-plumbus/20 rounded border border-plumbus':
            variant == 'outline',
          'opacity-50 cursor-not-allowed pointer-events-none': isDisabled,
          'animate-pulse cursor-wait pointer-events-none': isLoading,
        },
        className
      )}
      disabled={isDisabled}
      {...rest}
    >
      {isLoading ? <CgSpinnerAlt className="animate-spin" /> : leftIcon}
      <div>{children}</div>
      {!isLoading && rightIcon}
    </button>
  )
}

export default Button
