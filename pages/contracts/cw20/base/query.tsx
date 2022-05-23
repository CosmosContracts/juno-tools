import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import type { QueryType } from 'utils/contracts/cw20/query'
import { dispatchQuery, QUERY_LIST } from 'utils/contracts/cw20/query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW20QueryPage: NextPage = () => {
  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'CW20 Address',
    subtitle: 'Address of the CW20 token',
  })
  const address = contractState.value

  const ownerState = useInputState({
    id: 'owner-address',
    name: 'owner-address',
    title: 'Owner Address',
    subtitle: 'Address of the user - defaults to current address',
  })
  const ownerAddress = ownerState.value

  const spenderState = useInputState({
    id: 'spender-address',
    name: 'spender-address',
    title: 'Spender Address',
    subtitle: 'Address of the user - defaults to current address',
  })
  const spenderAddress = spenderState.value

  const [type, setType] = useState<QueryType>('balance')

  const addressVisible = type === 'balance' || type === 'allowance' || type === 'all_allowance'

  const { data: response } = useQuery(
    [address, type, contract, wallet, ownerAddress, spenderAddress] as const,
    async ({ queryKey }) => {
      const [_address, _type, _contract, _wallet, _ownerAddress, _spenderAddress] = queryKey
      const messages = contract?.use(_address)
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const ownerAddress = _ownerAddress || _wallet.address
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const spenderAddress = _spenderAddress || _wallet.address
      const result = await dispatchQuery({
        ownerAddress,
        spenderAddress,
        messages,
        type,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message)
      },
      enabled: Boolean(address && type && contract && wallet),
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (address.length > 0) {
      void router.replace({ query: { contractAddress: address } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query CW20 Token" />
      <ContractPageHeader
        description="CW20 Base is a specification for fungible tokens based on CosmWasm."
        link={links['Docs CW20 Base']}
        title="CW20 Base Contract"
      />
      <LinkTabs activeIndex={1} data={cw20LinkTabs} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <FormControl htmlId="contract-query-type" subtitle="Type of query to be dispatched" title="Query Type">
            <select
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-select',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20',
              )}
              id="contract-query-type"
              name="query-type"
              onChange={(e) => setType(e.target.value as QueryType)}
            >
              {QUERY_LIST.map(({ id, name }) => (
                <option key={`query-${id}`} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={addressVisible}>
            <AddressInput {...ownerState} />
          </Conditional>
          <Conditional test={type === 'allowance'}>
            <AddressInput {...spenderState} />
          </Conditional>
        </div>
        <JsonPreview content={address ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(CW20QueryPage, { center: false })
