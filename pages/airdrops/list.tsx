import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Contract } from '@cosmjs/cosmwasm-stargate'
import { useTheme } from 'contexts/theme'
import { ImArrowRight2 } from 'react-icons/im'
import Link from 'next/link'
import { CW20_MERKLE_DROP_CODE_ID } from 'utils/constants'

const AirdropList: NextPage = () => {
  const wallet = useWallet()
  const theme = useTheme()

  const [contracts, setContracts] = useState<Array<Contract>>([])

  useEffect(() => {
    const client = wallet.getClient()

    client.getContracts(CW20_MERKLE_DROP_CODE_ID).then((contracts) => {
      if (contracts) {
        Promise.all(
          contracts.map((address) => client.getContract(address))
        ).then((contractList) => {
          const filtered = contractList.filter(
            (item) => item !== undefined
          ) as Array<Contract>
          if (contractList) setContracts(filtered)
        })
      }
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
            {contracts.map((contract, idx) => {
              return (
                <tr key={contract.address} className="hover">
                  <td>{idx + 1}</td>
                  <td>{contract.label}</td>
                  <td>999999999</td>
                  <td>999999999</td>
                  <td>30</td>
                  <td>{new Date().toDateString()}</td>
                  <td>{new Date().toDateString()}</td>
                  <td>
                    <Link
                      href={`/airdrops/${contract.address}/claim`}
                      passHref
                      key={contract.address}
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
