import clsx from 'clsx'
import type { ComponentProps, ReactNode } from 'react'

export interface StackedListProps extends ComponentProps<'dl'> {
  children: ReactNode
}

export const StackedList = (props: StackedListProps) => {
  const { className, ...rest } = props

  return (
    <dl
      className={clsx('bg-white/5 rounded border-2 border-white/25', 'divide-y-2 divide-white/25', className)}
      {...rest}
    />
  )
}

export interface StackedListItemProps extends ComponentProps<'dt'> {
  name: ReactNode
}

StackedList.Item = function StackedListItem(props: StackedListItemProps) {
  const { name, className, ...rest } = props

  return (
    <div className="grid grid-cols-3 py-3 px-4 hover:bg-white/5">
      <dd className="font-medium text-white/50">{name}</dd>
      <dt className={clsx('col-span-2', className)} {...rest} />
    </div>
  )
}
