import clsx from 'clsx'

import Anchor, { AnchorProps } from './Anchor'

export type ButtonVariant = 'solid' | 'outline'

export interface AnchorButtonProps extends AnchorProps {
  isDisabled?: boolean
  leftIcon?: JSX.Element
  rightIcon?: JSX.Element
  variant?: ButtonVariant
}

const AnchorButton = (props: AnchorButtonProps) => {
  const {
    leftIcon,
    rightIcon,
    variant = 'solid',
    className,
    children,
    ...rest
  } = props

  return (
    <Anchor
      className={clsx(
        'group flex items-center py-2 px-4 space-x-2 font-bold focus:ring',
        {
          'bg-plumbus-60 hover:bg-plumbus-50 rounded ': variant == 'solid',
          'bg-plumbus/10 hover:bg-plumbus/20 rounded border border-plumbus':
            variant == 'outline',
        },
        className
      )}
      {...rest}
    >
      {leftIcon}
      <div className="group-hover:underline">{children}</div>
      {rightIcon}
    </Anchor>
  )
}

export default AnchorButton
