import { coin } from '@cosmjs/proto-signing'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import toast from 'react-hot-toast'


//import {
//   MAINNET_CW1_SUBKEYS_CODE_ID,
//   TESTNET_CW1_SUBKEYS_CODE_ID,
// } from 'utils/constants'

const CW3Timelock = () => {
  const wallet = useWallet()
  const contract = useContracts().cw3Timelock
  const cw20contract = useContracts().cw20Base

  const [txResponse, setTxResponse] = useState<any>()

  const instantiate = async () => {
    try {
      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }

      const response = contract.instantiate(
      625,
      { 
        admins:[""],
        min_delay: 3600000000000,
        proposers:[""],
      },
      'Timelock Test',
    )
    console.log("Response: " + response);
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const query = async () => {
    try {
      const client = contract?.use(
        'juno16cps0cp958sx9e9lz52rc9tzvrm7shs9ne8nakkhqydm06nkgeasszskda'
      )
      console.log(client)

      const response = await client?.getAdmins(client.contractAddress)

      console.log(response)

    
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const client = contract?.use(
        'juno16cps0cp958sx9e9lz52rc9tzvrm7shs9ne8nakkhqydm06nkgeasszskda'
      )
      //console.log(client)

      const cw20client = cw20contract?.use(
        'juno1syzle8llhh4sp2dzymn0zeuh7zq0c7eq83edt04w6ha0n7620p7q2jnpzy'
      )

      
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div>
      <div className="flex flex-col">
        <button className="p-3 bg-red-400 rounded-lg" onClick={instantiate}>
          Click to Instantiate
        </button>
        <button className="p-3 bg-blue-400 rounded-lg" onClick={query}>
          Click to Query
        </button>
        <button className="p-3 bg-green-400 rounded-lg" onClick={execute}>
          Click to Execute
        </button>

        <div>{JSON.stringify(txResponse)}</div>
      </div>
    </div>
  )
}

export default CW3Timelock
