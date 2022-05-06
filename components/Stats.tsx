import clsx from 'clsx'
import type { ReactNode } from 'react'

export interface StatsProps {
  title: string
  children: ReactNode
}

export const Stats = ({ title, children }: StatsProps) => {
  return (
    <div className={clsx('flex flex-col p-6 space-y-1', 'bg-white/10 rounded border-2 border-white/20 backdrop-blur')}>
      <div className="font-bold text-white/50">{title}</div>
      <div className="text-4xl font-bold">{children}</div>
    </div>
  )
}

export interface StatsDenomProps {
  text: string | null
}

Stats.Denom = function StatsDenom({ text }: StatsDenomProps) {
  /* Slice the first character because we get "u" for the denom */
  return <span className="font-mono text-xl">{text?.slice(1)}</span>
}
