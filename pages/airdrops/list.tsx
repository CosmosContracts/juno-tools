import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { useTheme } from 'contexts/theme'
import Link from 'next/link'
import axios from 'axios'
import toast from 'react-hot-toast'

interface AirdropListProps {
  name: string
  contractAddress: string
  totalAmount: number
  claimed: number
  allocation: number
  start: string
  expiration: string
}

const AirdropList: NextPage = () => {
  const theme = useTheme()

  const [airdrops, setAirdrops] = useState<Array<AirdropListProps>>([])

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/airdrops`)
      .then(({ data }) => {
        const { airdrops } = data
        setAirdrops(airdrops)
      })
      .catch((err: any) => {
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      })
  }, [])

  return (
    <div className="h-3/4 px-10 flex flex-col">
      <h1 className="text-6xl font-bold text-center">Available Airdrops</h1>

      <div className="mt-5 mb-10 text-center text-lg">
        Go through the available airdrops to claim your tokens!
      </div>

      <div className="w-full overflow-x-auto">
        <table
          data-theme={`${theme.isDarkTheme ? 'dark' : 'bumblebee'}`}
          className="table table-zebra"
        >
          <thead className="sticky top-0">
            <tr>
              <th></th>
              <th>Airdrop Name</th>
              <th>Total Amount</th>
              <th>Claimed Amount</th>
              <th>Your Allocation</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {airdrops.map((airdrop, idx) => {
              return (
                <tr key={airdrop.contractAddress} className="hover">
                  <td>{idx + 1}</td>
                  <td>{airdrop.name}</td>
                  <td>{airdrop.totalAmount}</td>
                  <td>{airdrop.claimed}</td>
                  <td>{airdrop.allocation || '-'}</td>
                  <td>{airdrop.start}</td>
                  <td>{airdrop.expiration}</td>
                  <td>
                    <Link
                      href={`/airdrops/${airdrop.contractAddress}/claim`}
                      passHref
                    >
                      <button className="border p-2 px-6 rounded-lg">
                        CLAIM
                      </button>
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex-1"></div>
    </div>
  )
}

export default AirdropList
