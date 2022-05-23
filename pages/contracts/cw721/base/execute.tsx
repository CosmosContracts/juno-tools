import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecuteCombobox } from 'components/contracts/cw721/base/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/cw721/base/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonTextArea } from 'components/forms/FormTextArea'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw721BaseLinkTabs } from 'components/LinkTabs.data'
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
import type { DispatchExecuteArgs } from 'utils/contracts/cw721/base/execute'
import { dispatchExecute, isEitherType, previewExecutePayload } from 'utils/contracts/cw721/base/execute'
import { parseJson } from 'utils/json'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW721BaseExecutePage: NextPage = () => {
  const { cw721Base: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'CW721 Contract Address',
    subtitle: 'Address of the CW721 contract',
  })

  const messageState = useInputState({
    id: 'message',
    name: 'message',
    title: 'Message',
    subtitle: 'Message to execute on the contract',
    defaultValue: JSON.stringify({ key: 'value' }, null, 2),
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const tokenIdState = useInputState({
    id: 'token-id',
    name: 'token-id',
    title: 'Token ID',
    subtitle: 'Identifier of the token',
    placeholder: 'some_token_id',
  })

  const showMessageField = type === 'send_nft'
  const showRecipientField = isEitherType(type, [
    'transfer_nft',
    'send_nft',
    'approve',
    'revoke',
    'approve_all',
    'revoke_all',
    'mint',
  ])
  const showTokenIdField = isEitherType(type, ['transfer_nft', 'send_nft', 'approve', 'revoke', 'mint', 'burn'])

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    contract: contractState.value,
    messages,
    msg: parseJson(messageState.value) || {},
    recipient: recipientState.value,
    txSigner: wallet.address,
    type,
    tokenId: tokenIdState.value,
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
      <NextSeo title="Execute CW721 Base Contract" />
      <ContractPageHeader
        description="CW721 Base is a specification for non fungible tokens based on CosmWasm."
        link={links['Docs CW721 Base']}
        title="CW721 Base Contract"
      />
      <LinkTabs activeIndex={2} data={cw721BaseLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showRecipientField && <AddressInput {...recipientState} />}
          {showTokenIdField && <AddressInput {...tokenIdState} />}
          {showMessageField && <JsonTextArea {...messageState} />}
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

export default withMetadata(CW721BaseExecutePage, { center: false })
