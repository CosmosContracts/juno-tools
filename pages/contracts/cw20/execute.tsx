import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { withMetadata } from 'utils/layout'

const CW20ExecutePage: NextPage = () => {
  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />

      <PageHeaderCw20 />

      <LinkTabs activeIndex={2} data={cw20LinkTabs} />
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
