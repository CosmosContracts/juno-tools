import clsx from 'clsx'
import Anchor from 'components/Anchor'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import LinkTabs from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
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
import { links } from 'utils/links'

const CW20QueryPage: NextPage = () => {
  const [address, setAddress] = useState<string>('')
  const [type, setType] = useState<QueryType>('balance')

  const { cw20Base: contract } = useContracts()
  const wallet = useWallet()

  const { data: response } = useQuery(
    [address, type, contract, wallet] as const,
    async ({ queryKey }) => {
      const [_address, _type, _contract, _wallet] = queryKey
      const messages = contract?.use(_address)
      const result = await dispatchQuery({ wallet, messages, type })
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

      <h1 className="font-heading text-4xl font-bold">CW20 Tokens</h1>
      <p>
        CW20 is a specification for fungible tokens based on CosmWasm. Learn
        more in the{' '}
        <Anchor
          href={links['Docs CW20']}
          className="font-bold text-plumbus hover:underline"
        >
          documentation page
        </Anchor>
        .
      </p>

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
