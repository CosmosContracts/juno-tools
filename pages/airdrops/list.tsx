import axios from 'axios'
import { useTheme } from 'contexts/theme'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import { QueryFunctionContext, useQuery } from 'react-query'

interface AirdropLogo {
  url: string
}

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
  logo: AirdropLogo | null
}

const AIRDROPS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/airdrops`

const getAirdrops = async ({ queryKey }: QueryFunctionContext<string[]>) => {
  const [endpoint, address] = queryKey
  const { data } = await axios.get(endpoint, { params: { address } })
  return data.airdrops as AirdropListProps[]
}

const AirdropList: NextPage = () => {
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

  const getDate = (date: number, type: string | null) => {
    if (type === null) return '-'
    if (type === 'height') return date
    else {
      const d = new Date(date * 1000)
      return d.toLocaleDateString('en-US') + ' approx'
    }
  }

  return (
    <div className="flex flex-col px-10 h-3/4">
      <h1 className="text-6xl font-bold text-center">Available Airdrops</h1>

      <div className="mt-5 mb-10 text-lg text-center">
        Go through the available airdrops to claim your tokens!
      </div>

      {loading ? (
        <div className="flex justify-center items-center w-full">
          <div className="w-5 h-5 rounded-full border-b-2 animate-spin border-gray-900" />
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          {airdrops.length > 0 ? (
            <table
              data-theme={`${theme.isDarkTheme ? 'dark' : 'bumblebee'}`}
              className="table table-zebra"
            >
              <thead className="sticky top-0">
                <tr>
                  <th></th>
                  <th>Logo</th>
                  <th>Airdrop Name</th>
                  <th>Total Amount</th>
                  <th>Claimed Amount</th>
                  <th>Your Allocation</th>
                  <th>Start (height/time)</th>
                  <th>End (height/time)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {airdrops.map((airdrop, idx) => {
                  return (
                    <tr key={airdrop.contractAddress} className="hover">
                      <td>{idx + 1}</td>
                      <td>
                        {airdrop.logo && airdrop.logo.url ? (
                          // eslint-disable-next-line
                          <img
                            src={airdrop.logo.url}
                            alt={airdrop.name}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>{airdrop.name}</td>
                      <td>{airdrop.totalAmount}</td>
                      <td>{airdrop.claimed}</td>
                      <td>{airdrop.allocation || '-'}</td>
                      <td>{getDate(airdrop.start, airdrop.startType)}</td>
                      <td>
                        {getDate(airdrop.expiration, airdrop.expirationType)}
                      </td>
                      <td>
                        <button
                          className="p-2 px-6 rounded-lg border"
                          onClick={() => claimOnClick(airdrop.contractAddress)}
                        >
                          CLAIM
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="w-full text-center">No airdrops found!</div>
          )}
        </div>
      )}
      <div className="flex-1"></div>
    </div>
  )
}

export default AirdropList
