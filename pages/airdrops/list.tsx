import axios from 'axios'
import clsx from 'clsx'
import AirdropsTable, { IAirdrop } from 'components/AirdropsTable'
import Anchor from 'components/Anchor'
import SearchInput from 'components/SearchInput'
import { useWallet } from 'contexts/wallet'
import { matchSorter } from 'match-sorter'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { QueryFunctionContext, useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'

const AIRDROPS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/airdrops`

const getAirdrops = async ({ queryKey }: QueryFunctionContext<string[]>) => {
  const [endpoint, address] = queryKey
  const { data } = await axios.get(endpoint, { params: { address } })
  return data.airdrops as IAirdrop[]
}

const AirdropListPage: NextPage = () => {
  const wallet = useWallet()

  const { data: airdrops = [], isLoading: loading } = useQuery(
    [AIRDROPS_ENDPOINT, wallet.address],
    getAirdrops,
    {
      onError: (err: Error) => {
        toast.error(err.message, { style: { maxWidth: 'none' } })
      },
    }
  )

  const [search, setSearch] = useState('')

  const renderResults = useMemo(
    () =>
      search.length > 0
        ? matchSorter(airdrops, search, { keys: ['name', 'contractAddress'] })
        : airdrops,
    [airdrops, search]
  )

  return (
    <section className="flex flex-col px-12 pt-6 space-y-4 h-screen">
      <NextSeo title="Airdrops List" />

      {/* header section */}
      <div className="flex items-center space-x-4">
        <h1 className="text-4xl font-bold">Airdrops</h1>
        <SearchInput
          id="airdrop-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
        />
        <div className="flex-grow" />
        <Anchor
          href="/airdrops/create"
          className={clsx(
            'font-bold text-black uppercase',
            'py-2 px-4 bg-plumbus rounded',
            'focus:ring active:ring ring-offset-2'
          )}
        >
          + Create
        </Anchor>
      </div>

      {/* description */}
      <p>Go through the available airdrops to claim your tokens!</p>

      {/* airdrops table loading placeholder */}
      {loading && (
        <div className="flex justify-center items-center p-8 space-x-4 text-xl text-center text-white/50">
          <CgSpinnerAlt className="animate-spin" />
          <span>Loading airdrops...</span>
        </div>
      )}

      {/* airdrops table */}
      <div className="overflow-auto flex-grow no-scrollbar">
        {!loading && <AirdropsTable data={renderResults} />}
      </div>
    </section>
  )
}

export default withMetadata(AirdropListPage, { center: false })
