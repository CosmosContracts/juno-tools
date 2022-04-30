import { ExecuteCombobox } from 'components/cw20/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/cw20/ExecuteCombobox.hooks'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { withMetadata } from 'utils/layout'

const CW20ExecutePage: NextPage = () => {
  const addressState = useInputState({
    id: 'sender-address',
    name: 'sender',
    title: 'Sender Address',
    subtitle: 'Address of the CW20 token',
  })
  const comboboxState = useExecuteComboboxState()

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />
      <PageHeaderCw20 />
      <LinkTabs activeIndex={2} data={cw20LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...addressState} />
          <ExecuteCombobox {...comboboxState} />
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
