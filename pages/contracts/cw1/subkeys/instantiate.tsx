import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { StyledInput } from 'components/forms/StyledInput'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw1SubkeysLinkTabs } from 'components/LinkTabs.data'
import { Radio } from 'components/Radio'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/cw1/subkeys'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { CW1_SUBKEYS_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const MUTABLE_RADIO_VALUES = [
  {
    id: 'true',
    title: 'Changeable',
    subtitle: `You will be able to change the admins of the contract after it's been instantiated`,
  },
  {
    id: 'false',
    title: 'Not Changeable',
    subtitle: 'You will freeze the admins, making them unchangable after instantiation',
  },
]

type RadioValue = 'true' | 'false'

const CW1SubkeysInstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().cw1Subkeys

  const [mutableType, setMutableType] = useState<RadioValue>('true')

  const addressListState = useAddressListState()

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }
      const msg = {
        admins: addressListState.values.map((item) => item.address),
        mutable: mutableType === 'true',
      }
      return toast.promise(
        contract.instantiate(CW1_SUBKEYS_CODE_ID, msg, 'JunoTools CW1 Subkeys Contract', wallet.address),
        {
          loading: 'Instantiating contract...',
          error: 'Instantiation failed!',
          success: 'Instantiation success!',
        },
      )
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
    },
  )

  const mutableOnChange = (value: string) => {
    setMutableType(value as RadioValue)
  }

  const txHash = data?.transactionHash

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate CW1 Subkeys Contract" />
      <ContractPageHeader
        description="CW1 Subkeys is a whitelisting contract dealing with Send, Delegate, Undelegate, Redelegate and Withdraw messages."
        link={links['Docs CW1 Subkeys']}
        title="CW1 Subkeys Contract"
      />
      <LinkTabs activeIndex={0} data={cw1SubkeysLinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Basic information about your new contract" title="Contract Details">
        <AddressList
          entries={addressListState.entries}
          isRequired
          onAdd={addressListState.add}
          onChange={addressListState.update}
          onRemove={addressListState.remove}
          subtitle="Enter the admins you want in your contract"
          title="Admins"
        />

        <FormControl isRequired subtitle="Decide if you want to change the admins later on" title="Admins Lock">
          <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
            {MUTABLE_RADIO_VALUES.map(({ id, title, subtitle }) => (
              <Radio
                key={`mutable-${id}`}
                checked={mutableType === id}
                htmlFor="mutable"
                id={id}
                onChange={() => mutableOnChange(id)}
                subtitle={subtitle}
                title={title}
              />
            ))}
          </fieldset>
        </FormControl>
      </FormGroup>

      <div className="flex items-center p-4">
        {txHash && (
          <FormControl subtitle="Previous instantiation transaction hash" title="Transaction Hash">
            <StyledInput
              className={clsx(txHash ? 'read-only:text-white select-all' : 'read-only:text-white/50 select-none')}
              readOnly
              value={txHash}
            />
          </FormControl>
        )}
        <div className="flex-grow" />
        <Button isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(CW1SubkeysInstantiatePage, { center: false })
