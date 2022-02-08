import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTheme } from 'contexts/theme'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'

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

const AirdropList: NextPage = () => {
  const theme = useTheme()
  const wallet = useWallet()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [airdrops, setAirdrops] = useState<Array<AirdropListProps>>([])

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/airdrops`, {
        params: {
          address: wallet.address,
        },
      })
      .then(({ data }) => {
        const { airdrops } = data
        setAirdrops(airdrops)
        setLoading(false)
      })
      .catch((err: any) => {
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
        setLoading(false)
      })
  }, [wallet.address])

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
    <div className="h-3/4 px-10 flex flex-col">
      <h1 className="text-6xl font-bold text-center">Available Airdrops</h1>

      <div className="mt-5 mb-10 text-center text-lg">
        Go through the available airdrops to claim your tokens!
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
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
                            className="h-12 w-12 rounded-full"
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
                          className="border p-2 px-6 rounded-lg"
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
