import type { ReactNode } from 'react'

export interface ConditionalProps {
  test: boolean
  children: ReactNode
}

export const Conditional = ({ test, children }: ConditionalProps) => {
  if (!test) return null
  return <>{children}</>
}
