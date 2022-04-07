import clsx from 'clsx'
import Conditional from 'components/Conditional'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import LinkTabs from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import PageHeaderCW20 from 'components/PageHeaderCW20'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useQuery } from 'react-query'
import { dispatchQuery, QUERY_ENTRIES, QueryType } from 'utils/cw20'
import { withMetadata } from 'utils/layout'

const CW20QueryPage: NextPage = () => {
  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [ownerAddress, setOwnerAddress] = useState<string>('')
  const [spenderAddress, setSpenderAddress] = useState<string>('')
  const [type, setType] = useState<QueryType>('balance')

  const addressVisible =
    type === 'balance' || type === 'allowance' || type === 'all_allowance'

  const { data: response } = useQuery(
    [address, type, contract, wallet, ownerAddress, spenderAddress] as const,
    async ({ queryKey }) => {
      const [
        _address,
        _type,
        _contract,
        _wallet,
        _ownerAddress,
        _spenderAddress,
      ] = queryKey
      const messages = contract?.use(_address)
      const ownerAddress = _ownerAddress || _wallet.address
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
    }
  )

  const router = useRouter()

  useEffect(() => {
    if (address.length > 0) {
      router.replace({ query: { contractAddress: address } })
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

      <PageHeaderCW20 />

      <LinkTabs data={cw20LinkTabs} activeIndex={1} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <FormControl
            title="CW20 Address"
            subtitle="Address of the CW20 token"
            htmlId="contract-address"
          >
            <Input
              id="contract-address"
              name="cw20"
              type="text"
              placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </FormControl>
          <FormControl
            title="Query Type"
            subtitle="Type of query to be dispatched"
            htmlId="contract-query-type"
          >
            <select
              id="contract-query-type"
              name="query-type"
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-select',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20'
              )}
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
              title="Owner Address"
              subtitle="Address of the user - defaults to current address"
              htmlId="owner-address"
            >
              <Input
                id="owner-address"
                name="address"
                type="text"
                placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
                value={ownerAddress}
                onChange={(e) => setOwnerAddress(e.target.value)}
              />
            </FormControl>
          </Conditional>
          <Conditional test={type === 'all_allowance'}>
            <FormControl
              title="Spender Address"
              subtitle="Address of the user - defaults to current address"
              htmlId="spender-address"
            >
              <Input
                id="spender-address"
                name="address"
                type="text"
                placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
                value={spenderAddress}
                onChange={(e) => setSpenderAddress(e.target.value)}
              />
            </FormControl>
          </Conditional>
        </div>
        <JsonPreview
          title="Query Response"
          content={address ? { type, response } : null}
        />
      </div>
    </section>
  )
}

export default withMetadata(CW20QueryPage, { center: false })
