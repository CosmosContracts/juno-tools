import { Anchor } from 'components/Anchor'

import { PageHeader } from './PageHeader'

interface ContractPageHeaderProps {
  title: string
  description?: string
  link: string
}

export const ContractPageHeader = ({ title, description, link }: ContractPageHeaderProps) => {
  return (
    <PageHeader title={title}>
      {description} Learn more in the{' '}
      <Anchor className="font-bold text-plumbus hover:underline" href={link}>
        documentation
      </Anchor>
      .
    </PageHeader>
  )
}
