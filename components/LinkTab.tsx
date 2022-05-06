import clsx from 'clsx'
import { Anchor } from 'components/Anchor'

export interface LinkTabProps {
  title: string
  description: string
  href: string
  isActive?: boolean
}

export const LinkTab = (props: LinkTabProps) => {
  const { title, description, href, isActive } = props

  return (
    <Anchor
      className={clsx(
        'isolate p-4 space-y-1 border-2',
        'first-of-type:rounded-tl-md last-of-type:rounded-tr-md',
        isActive ? 'border-plumbus' : 'border-transparent',
        isActive ? 'bg-plumbus/5 hover:bg-plumbus/10' : 'hover:bg-white/5',
      )}
      href={href}
    >
      <h4 className="font-bold">{title}</h4>
      <span className="text-sm text-white/80 line-clamp-2">{description}</span>
    </Anchor>
  )
}
