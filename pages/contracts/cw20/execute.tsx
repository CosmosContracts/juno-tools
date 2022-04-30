import clsx from 'clsx'
import { Button } from 'components/Button'
import { ExecuteCombobox } from 'components/cw20/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/cw20/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { StyledInput } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { dispatchExecute, dispatchPreviewPayload, isEitherType } from 'utils/cw20/execute'
import { withMetadata } from 'utils/layout'

const CW20ExecutePage: NextPage = () => {
  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

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

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      const messages = contract?.use(txSigner)
      const txHash = await toast.promise(
        dispatchExecute({
          amount: amountState.value.toString(),
          contract: contractState.value,
          description: '',
          logo: { url: '' },
          marketing: '',
          messages,
          msg: {},
          owner: ownerState.value,
          project: '',
          recipient: recipientState.value,
          txSigner,
          type,
        }),
        {
          error: `${type} execute failed!`,
          loading: 'Dispatching execution...',
          success: (tx) => `Transaction ${tx} success!`,
        },
      )
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
      <PageHeaderCw20 />
      <LinkTabs activeIndex={2} data={cw20LinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...senderState} />
          <ExecuteCombobox {...comboboxState} />
          {showOwnerField && <AddressInput {...ownerState} />}
          {showContractField && <AddressInput {...contractState} />}
          {showRecipientField && <AddressInput {...recipientState} />}
          {showAmountField && <NumberInput {...amountState} />}
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl
              className={lastTx ? 'visible' : 'invisible'}
              subtitle="View previous execution transaction hash"
              title="Transaction Hash"
            >
              <StyledInput className={clsx(lastTx ? 'select-all' : 'select-none')} readOnly value={lastTx || '...'} />
            </FormControl>
          </div>
          <FormControl subtitle="View current data to be sent" title="Payload Preview">
            <JsonPreview
              content={dispatchPreviewPayload({
                amount: amountState.value.toString(),
                contract: contractState.value,
                description: '',
                logo: { url: '' },
                marketing: '',
                msg: {},
                owner: ownerState.value,
                project: '',
                recipient: recipientState.value,
                txSigner,
                type,
              })}
              title={type ? `${type} payload preview` : 'payload preview'}
            />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CW20ExecutePage, { center: false })
