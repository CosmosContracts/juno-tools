import axios from 'axios'
import { AirdropsTable } from 'components/AirdropsTable'
import { AnchorButton } from 'components/AnchorButton'
import { Button } from 'components/Button'
import { SearchInput } from 'components/SearchInput'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaArrowLeft, FaArrowRight, FaPlus } from 'react-icons/fa'
import type { QueryFunctionContext } from 'react-query'
import { useQuery } from 'react-query'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'

const AIRDROPS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/airdrops`

const getAirdrops = async ({ queryKey }: QueryFunctionContext<string[]>) => {
  const [endpoint, address, page, search] = queryKey
  const { data } = await axios.get(endpoint, {
    params: { address, page, search },
  })
  return data
}

const AirdropListPage: NextPage = () => {
  const router = useRouter()
  const { address } = useWallet()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const searchDebounce = useDebounce(search, 1000)

  const { data: airdropsData = {}, isLoading: loading } = useQuery(
    [AIRDROPS_ENDPOINT, address, page.toString(), searchDebounce],
    getAirdrops,
    {
      onError: (err: Error) => {
        toast.error(err.message, { style: { maxWidth: 'none' } })
      },
    },
  )

  const previousOnClick = () => {
    if (page === 1) return
    window.history.replaceState(null, '', `?page=${page - 1}`)
    setPage(page - 1)
  }

  const nextOnClick = () => {
    if (!airdropsData.hasMore) return
    window.history.replaceState(null, '', `?page=${page + 1}`)
    setPage(page + 1)
  }

  useEffect(() => {
    if (router.query.page && typeof router.query.page === 'string') setPage(Number(router.query.page))
  }, [router.query])

  useEffect(() => {
    setPage(1)
  }, [searchDebounce])

  return (
    <section className="flex flex-col px-12 pt-6 space-y-4 h-screen">
      <NextSeo title="Airdrops List" />

      {/* header section */}
      <div className="flex items-center space-x-4">
        <h1 className="font-heading text-4xl font-bold">Airdrops</h1>
        <SearchInput
          id="airdrop-search"
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          value={search}
        />
        <div className="flex-grow" />
        <AnchorButton href="/airdrops/create" leftIcon={<FaPlus />}>
          Create Airdrop
        </AnchorButton>
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
      <div className="overflow-auto h-[calc(100vh-220px)] no-scrollbar">
        {!loading && <AirdropsTable data={airdropsData.airdrops || []} />}
      </div>

      {/* Paginiation buttons */}
      {!loading && (
        <div className="flex justify-end space-x-4">
          <Button isDisabled={page === 1} leftIcon={<FaArrowLeft />} onClick={previousOnClick}>
            Previous page
          </Button>
          <Button isDisabled={!airdropsData.hasMore} onClick={nextOnClick} rightIcon={<FaArrowRight />}>
            Next page
          </Button>
        </div>
      )}
    </section>
  )
}

export default withMetadata(AirdropListPage, { center: false })
