import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormGroup } from 'components/FormGroup'
import { AddressBalances } from 'components/forms/AddressBalances'
import { useAddressBalancesState } from 'components/forms/AddressBalances.hooks'
import { AddressInput, NumberInput, TextInput, UrlInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/cw1/subkeys'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { useMutation } from 'react-query'
import { CW20_BASE_CODE_ID } from 'utils/constants'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW20InstantiatePage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

  const nameState = useInputState({
    id: 'name',
    name: 'name',
    title: 'Name',
    placeholder: 'My Awesome CW20 Contract',
  })

  const symbolState = useInputState({
    id: 'symbol',
    name: 'symbol',
    title: 'Symbol',
    placeholder: 'AWSM',
  })

  const decimalsState = useNumberInputState({
    id: 'decimals',
    name: 'decimals',
    title: 'Decimals',
    placeholder: '6',
    defaultValue: 6,
  })

  const balancesState = useAddressBalancesState()

  const minterState = useInputState({
    id: 'minter-address',
    name: 'minterAddress',
    title: 'Minter Address',
    defaultValue: wallet.address,
  })

  const capState = useInputState({
    id: 'cap',
    name: 'cap',
    title: 'Cap',
    placeholder: '9999',
  })

  const projectState = useInputState({
    id: 'project',
    name: 'projectName',
    title: 'Project',
    placeholder: 'My Awesome Project',
  })

  const descriptionState = useInputState({
    id: 'description',
    name: 'description',
    title: 'Description',
    placeholder: 'This is my awesome contract project',
  })

  const walletAddressState = useInputState({
    id: 'wallet-address',
    name: 'marketingAddress',
    title: 'Wallet Address (marketing)',
    defaultValue: wallet.address,
  })

  const logoUrlState = useInputState({
    id: 'logo-url',
    name: 'logoUrl',
    title: 'Logo URL',
    placeholder: 'https://example.com/image.jpg',
  })

  const shouldSubmit = [nameState.value, symbolState.value].every(Boolean)

  const { data, isLoading, mutate } = useMutation(
    async (event: FormEvent): Promise<InstantiateResponse | null> => {
      event.preventDefault()
      if (!shouldSubmit) {
        throw new Error('Please fill required fields')
      }
      if (!contract) {
        throw new Error('Smart contract connection failed')
      }
      const msg = {
        name: nameState.value,
        symbol: symbolState.value,
        decimals: decimalsState.value || 6,
        initial_balances: balancesState.values,
        mint: {
          minter: minterState.value,
          cap: capState.value || null,
        },
        marketing: {
          project: projectState.value,
          description: descriptionState.value,
          marketing: walletAddressState.value,
          logo: {
            url: logoUrlState.value,
          },
        },
      }
      return toast.promise(contract.instantiate(CW20_BASE_CODE_ID, msg, msg.name, wallet.address), {
        loading: 'Instantiating contract...',
        error: 'Instantiation failed!',
        success: 'Instantiation success!',
      })
    },
    {
      onError: (error) => {
        toast.error(String(error))
      },
    },
  )

  const txHash = data?.transactionHash

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={mutate}>
      <NextSeo title="Instantiate CW20 Token" />
      <ContractPageHeader
        description="CW20 Base is a specification for fungible tokens based on CosmWasm."
        link={links['Docs CW20 Base']}
        title="CW20 Base Contract"
      />
      <LinkTabs activeIndex={0} data={cw20LinkTabs} />

      <Conditional test={Boolean(data)}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={data} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Basic information about your new contract" title="Contract Details">
        <TextInput isRequired {...nameState} />
        <TextInput isRequired {...symbolState} />
        <NumberInput isRequired {...decimalsState} />
        <AddressBalances
          entries={balancesState.entries}
          isRequired
          onAdd={balancesState.add}
          onChange={balancesState.update}
          onRemove={balancesState.remove}
          subtitle="Enter at least one wallet address and initial balance"
          title="Initial Balances"
        />
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup subtitle="Your new contract minting rules" title="Minting Details">
        <AddressInput {...minterState} />
        <NumberInput {...capState} />
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup subtitle="Public metadata for your new contract" title="Marketing Details">
        <TextInput {...projectState} />
        <TextInput {...descriptionState} />
        <AddressInput {...walletAddressState} />
        <UrlInput {...logoUrlState} />
      </FormGroup>

      <div className="flex items-center p-4">
        <div className="flex-grow" />
        <Button isDisabled={!shouldSubmit} isLoading={isLoading} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(CW20InstantiatePage, { center: false })
