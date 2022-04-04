import { links } from 'utils/links'

import Anchor from './Anchor'
import PageHeader from './PageHeader'

const PageHeaderCW20 = () => {
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

export default PageHeaderCW20
