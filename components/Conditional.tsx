import { ReactNode } from 'react'

export interface ConditionalProps {
  test: any
  children: ReactNode
}

const Conditional = ({ test, children }: ConditionalProps) => {
  if (!Boolean(test)) return null
  return <>{children}</>
}

export default Conditional
