import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/cw20/base/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/cw20/base/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, TextInput, UrlInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonTextArea } from 'components/forms/FormTextArea'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import type { DispatchExecuteArgs } from 'utils/contracts/cw20/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'utils/contracts/cw20/execute'
import { parseJson } from 'utils/json'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW20ExecutePage: NextPage = () => {
  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const amountState = useNumberInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount',
    subtitle: 'Enter amount of tokens to execute',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'CW20 Address',
    subtitle: 'Address of the CW20 token',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'Lorem ipsum dolor sit amet',
  })

  const logoUrlState = useInputState({
    id: 'logoUrl',
    name: 'logoUrl',
    title: 'Logo URL',
    placeholder: 'https://example.com/image.jpg',
  })

  const marketingState = useInputState({
    id: 'marketing',
    name: 'marketing',
    title: 'Marketing',
  })

  const messageState = useInputState({
    id: 'message',
    name: 'message',
    title: 'Message',
    subtitle: 'Message content for current transaction',
    defaultValue: JSON.stringify({ key: 'value' }, null, 2),
  })

  const ownerState = useInputState({
    id: 'owner-address',
    name: 'owner',
    title: 'Owner Address',
    subtitle: 'Address of the allowance giver',
  })

  const projectState = useInputState({
    id: 'project',
    name: 'project',
    title: 'Project',
    placeholder: 'My Awesome Project',
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const showAmountField = type && !isEitherType(type, ['update-logo', 'update-marketing'])
  // const showContractField = isEitherType(type, ['send', 'send-from'])
  const showUpdateLogoField = type === 'update-logo'
  const showMarketingFields = type === 'update-marketing'
  const showMessageField = isEitherType(type, ['send', 'send-from'])
  const showOwnerField = isEitherType(type, ['burn-from', 'send-from', 'transfer-from'])
  const showRecipientField = isEitherType(type, [
    'increase-allowance',
    'decrease-allowance',
    'transfer',
    'transfer-from',
    'send',
    'send-from',
    'mint',
  ])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    amount: amountState.value.toString(),
    contract: contractState.value,
    description: descriptionState.value,
    logo: { url: logoUrlState.value },
    marketing: marketingState.value,
    messages,
    msg: parseJson(messageState.value),
    owner: ownerState.value,
    project: projectState.value,
    recipient: recipientState.value,
    txSigner: wallet.address,
    type,
  }

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        console.error(error)
        toast.error(String(error))
      },
    },
  )

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW20 Token" />
      <ContractPageHeader
        description="CW20 Base is a specification for fungible tokens based on CosmWasm."
        link={links['Docs CW20 Base']}
        title="CW20 Base Contract"
      />
      <LinkTabs activeIndex={2} data={cw20LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showOwnerField && <AddressInput {...ownerState} />}
          {showRecipientField && <AddressInput {...recipientState} />}
          {showAmountField && <NumberInput {...amountState} />}
          {showMessageField && <JsonTextArea {...messageState} />}
          {showMarketingFields && (
            <>
              <TextInput {...projectState} />
              <TextInput {...descriptionState} />
              <AddressInput {...marketingState} />
            </>
          )}
          {showUpdateLogoField && <UrlInput {...logoUrlState} />}
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
