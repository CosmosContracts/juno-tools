import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import type { ComponentProps, ReactNode } from 'react'
import { FaArrowRight } from 'react-icons/fa'

export interface HomeCardProps extends ComponentProps<'div'> {
  title: string
  link?: string
  linkText?: string
  children?: ReactNode
}

export const HomeCard = (props: HomeCardProps) => {
  const { title, link, linkText, children, className, ...rest } = props
  return (
    <div className={clsx('flex relative flex-col space-y-4', className)} {...rest}>
      <h2 className="font-heading text-xl font-bold">{title}</h2>
      <p className="flex-grow text-white/75">{children}</p>
      {link && (
        <Anchor
          className={clsx(
            'flex before:absolute before:inset-0 items-center space-x-1',
            'font-bold text-plumbus hover:underline',
          )}
          href={link}
        >
          <span>{linkText ?? 'Open Link'}</span> <FaArrowRight size={12} />
        </Anchor>
      )}
    </div>
  )
}
