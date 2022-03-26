import Anchor from 'components/Anchor'
import LinkTabs from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW20ExecutePage: NextPage = () => {
  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />

      <h1 className="font-heading text-4xl font-bold">CW20 Tokens</h1>
      <p>
        CW20 is a specification for fungible tokens based on CosmWasm. Learn
        more in the{' '}
        <Anchor
          href={links['Docs CW20']}
          className="font-bold text-plumbus hover:underline"
        >
          documentation page
        </Anchor>
        .
      </p>

      <LinkTabs data={cw20LinkTabs} activeIndex={2} />
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
