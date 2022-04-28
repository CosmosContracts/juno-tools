import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCW20 } from 'components/PageHeaderCW20'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { withMetadata } from 'utils/layout'

const CW20ExecutePage: NextPage = () => {
  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />

      <PageHeaderCW20 />

      <LinkTabs data={cw20LinkTabs} activeIndex={2} />
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
