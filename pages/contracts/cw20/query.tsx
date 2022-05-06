import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { Input } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import type { QueryType } from 'utils/cw20'
import { dispatchQuery, QUERY_ENTRIES } from 'utils/cw20'
import { withMetadata } from 'utils/layout'

const CW20QueryPage: NextPage = () => {
  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [ownerAddress, setOwnerAddress] = useState<string>('')
  const [spenderAddress, setSpenderAddress] = useState<string>('')
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
    if (initial && initial.length > 0) setAddress(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query CW20 Token" />

      <PageHeaderCw20 />

      <LinkTabs activeIndex={1} data={cw20LinkTabs} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <FormControl htmlId="contract-address" subtitle="Address of the CW20 token" title="CW20 Address">
            <Input
              id="contract-address"
              name="cw20"
              onChange={(e) => setAddress(e.target.value)}
              placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
              type="text"
              value={address}
            />
          </FormControl>
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
              {QUERY_ENTRIES.map(({ id, name }) => (
                <option key={`query-${id}`} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={addressVisible}>
            <FormControl
              htmlId="owner-address"
              subtitle="Address of the user - defaults to current address"
              title="Owner Address"
            >
              <Input
                id="owner-address"
                name="address"
                onChange={(e) => setOwnerAddress(e.target.value)}
                placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
                type="text"
                value={ownerAddress}
              />
            </FormControl>
          </Conditional>
          <Conditional test={type === 'all_allowance'}>
            <FormControl
              htmlId="spender-address"
              subtitle="Address of the user - defaults to current address"
              title="Spender Address"
            >
              <Input
                id="spender-address"
                name="address"
                onChange={(e) => setSpenderAddress(e.target.value)}
                placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
                type="text"
                value={spenderAddress}
              />
            </FormControl>
          </Conditional>
        </div>
        <JsonPreview content={address ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(CW20QueryPage, { center: false })
