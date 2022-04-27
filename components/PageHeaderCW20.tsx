import { Anchor } from 'components/Anchor'
import { links } from 'utils/links'

import { PageHeader } from './PageHeader'

export const PageHeaderCW20 = () => {
  return (
    <PageHeader title="CW20 Tokens">
      CW20 is a specification for fungible tokens based on CosmWasm. Learn more
      in the{' '}
      <Anchor
        href={links['Docs CW20']}
        className="font-bold text-plumbus hover:underline"
      >
        documentation
      </Anchor>
      .
    </PageHeader>
  )
}
