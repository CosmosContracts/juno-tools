import axios from 'axios'
import clsx from 'clsx'
import Anchor from 'components/Anchor'
import { useTheme } from 'contexts/theme'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaSearch } from 'react-icons/fa'
import { QueryFunctionContext, useQuery } from 'react-query'
import { withMetadata } from 'utils/layout'

interface AirdropListProps {
  name: string
  contractAddress: string
  totalAmount: number
  claimed: number
  allocation: number
  start: number
  startType: string
  expiration: number
  expirationType: string
  logo: { url: string } | null
}

const AIRDROPS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/airdrops`

const getAirdrops = async ({ queryKey }: QueryFunctionContext<string[]>) => {
  const [endpoint, address] = queryKey
  const { data } = await axios.get(endpoint, { params: { address } })
  return data.airdrops as AirdropListProps[]
}

const getAirdropDate = (date: number, type: string | null) => {
  if (type === null) return '-'
  if (type === 'height') return date
  const d = new Date(date * 1000)
  return d.toLocaleDateString('en-US') + ' approx'
}

const AirdropListPage: NextPage = () => {
  const theme = useTheme()
  const wallet = useWallet()
  const router = useRouter()

  const { data: airdrops = [], isLoading: loading } = useQuery(
    [AIRDROPS_ENDPOINT, wallet.address],
    getAirdrops,
    {
      onError: (err: Error) => {
        toast.error(err.message, { style: { maxWidth: 'none' } })
      },
    }
  )

  const claimOnClick = (contractAddress: string) => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')
    router.push(`/airdrops/${contractAddress}/claim`)
  }

  return (
    <section className="relative py-6 px-12 space-y-4">
      {/* header section */}
      <div className="flex items-center space-x-4">
        <h1 className="text-4xl font-bold">Airdrops</h1>
        <form className="relative">
          <label
            htmlFor="airdrop-search"
            className="flex absolute inset-y-0 left-4 items-center"
          >
            <FaSearch size={16} />
          </label>
          <input
            id="airdrop-search"
            className="py-2 pr-4 pl-10 bg-white/10 rounded border-2 border-white/25 placeholder-white/50"
            placeholder="Search..."
          />
        </form>
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
      {!loading && (
        <table className="min-w-full">
          <thead className="border-b border-white/20">
            <tr className="text-left text-plumbus-matte">
              <th className="p-4">Name</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Claimed</th>
              <th className="p-4">Start</th>
              <th className="p-4">End</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20">
            {airdrops.length > 0 ? (
              airdrops.map((airdrop, i) => (
                <tr key={`airdrop-${i}`} className="hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center space-x-4 font-medium">
                      <img
                        src={airdrop.logo?.url ?? '/juno_logo.png'}
                        alt={airdrop.name}
                        className="overflow-hidden w-8 h-8 bg-plumbus rounded-full"
                      />
                      <span>{airdrop.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {airdrop.totalAmount.toLocaleString('en')}
                  </td>
                  <td className="p-4 text-right">
                    {airdrop.claimed.toLocaleString('en')}
                  </td>
                  <td className="p-4">
                    {getAirdropDate(airdrop.start, airdrop.startType)}
                  </td>
                  <td className="p-4">
                    {getAirdropDate(airdrop.expiration, airdrop.expirationType)}
                  </td>
                  <td className="p-4">
                    <button
                      className={clsx(
                        'font-bold text-plumbus uppercase',
                        'py-1 px-4 rounded border border-plumbus',
                        'bg-plumbus/10 hover:bg-plumbus/20'
                      )}
                      onClick={() => claimOnClick(airdrop.contractAddress)}
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-4 text-center text-white/50">
                  No airdrops available :(
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default withMetadata(AirdropListPage, { center: false })
