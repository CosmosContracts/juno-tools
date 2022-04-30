import { ExecuteCombobox } from 'components/cw20/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/cw20/ExecuteCombobox.hooks'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { isEitherType } from 'utils/cw20/execute'
import { withMetadata } from 'utils/layout'

const CW20ExecutePage: NextPage = () => {
  const wallet = useWallet()

  const senderState = useInputState({
    id: 'sender-address',
    name: 'sender',
    title: 'Sender Address',
    subtitle: 'Address of the sender CW20 token',
    defaultValue: wallet.address,
  })
  const txSigner = senderState.value

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const amountState = useNumberInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount',
    subtitle: 'Enter amount of tokens to execute',
  })
  const showAmountField = type && !isEitherType(type, ['update-logo', 'update-marketing'])

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract',
    title: 'Contract Address',
    subtitle: 'Address of the contract CW20 token',
  })
  const showContractField = isEitherType(type, ['send', 'send-from'])

  const ownerState = useInputState({
    id: 'owner-address',
    name: 'owner',
    title: 'Owner Address',
    subtitle: 'Address of the owner CW20 token',
  })
  const showOwnerField = isEitherType(type, ['burn-from', 'send-from', 'transfer-from'])

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient CW20 token',
  })
  const showRecipientField = isEitherType(type, ['increase-allowance', 'decrease-allowance', 'transfer-from'])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />
      <PageHeaderCw20 />
      <LinkTabs activeIndex={2} data={cw20LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...senderState} />
          <ExecuteCombobox {...comboboxState} />
          {showOwnerField && <AddressInput {...ownerState} />}
          {showContractField && <AddressInput {...contractState} />}
          {showRecipientField && <AddressInput {...recipientState} />}
          {showAmountField && <NumberInput {...amountState} />}
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
