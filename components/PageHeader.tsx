import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  children?: ReactNode
}

export const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <>
      <h1 className="font-heading text-4xl font-bold">{title}</h1>
      <p>{children}</p>
    </>
  )
}
