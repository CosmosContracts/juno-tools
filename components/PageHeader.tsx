import { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  children?: ReactNode
}

const PageHeader = ({ title, children }: PageHeaderProps) => {
  return (
    <>
      <h1 className="font-heading text-4xl font-bold">{title}</h1>
      <p>{children}</p>
    </>
  )
}

export default PageHeader
