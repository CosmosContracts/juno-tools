import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Contract } from '@cosmjs/cosmwasm-stargate'
import { useTheme } from 'contexts/theme'
import { ImArrowRight2 } from 'react-icons/im'
import Link from 'next/link'

const AirdropList: NextPage = () => {
  const wallet = useWallet()
  const theme = useTheme()

  const [contracts, setContracts] = useState<Array<Contract>>([])

  useEffect(() => {
    const client = wallet.getClient()

    client.getContracts(12).then((contracts) => {
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
    <div className="h-3/4 w-3/4 flex flex-col">
      <h1 className="text-6xl font-bold text-center">Available Airdrops</h1>

      <div className="mt-5 text-center text-lg">
        Go through the available airdrops to claim your tokens!
      </div>

      <div className="w-full p-5 flex flex-wrap justify-center overflow-x-hidden overflow-y-auto">
        {contracts.map((contract) => {
          return (
            <Link
              href={`/airdrops/${contract.address}/claim`}
              passHref
              key={contract.address}
            >
              <button>
                <div
                  key={contract.address}
                  className={`h-16 border-2 border-black rounded-lg mr-5 my-3 p-4 ${
                    theme.isDarkTheme ? 'border-gray/30' : 'border-dark/30'
                  } flex items-center`}
                >
                  {contract.label} <ImArrowRight2 className="ml-3" />
                </div>
              </button>
            </Link>
          )
        })}
      </div>

      <div className="flex-1"></div>
    </div>
  )
}

export default AirdropList
