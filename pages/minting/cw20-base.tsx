import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { InstantiateResponse } from 'contracts/cw20/base'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { CW20_BASE_CODE_ID } from 'utils/constants'

const CW20Base = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

  const [txResponse, setTxResponse] = useState<InstantiateResponse>()

  const instantiate = async () => {
    try {
      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }

      const msg = {
        name: 'Horse Coin',
        symbol: 'HORSE',
        decimals: 6,
        initial_balances: [
          {
            address: wallet.address,
            amount: '10000000',
          },
        ],
        //Optional
        mint: {
          minter: wallet.address,
          cap: '1000000000', // Optional
        },
        // Optional
        marketing: {
          project: 'Horse Project',
          description: 'Horses are cool',
          marketing: wallet.address,
          logo: {
            url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK3vUxZZXhDrHoLtbVbMNChIy71A8K8yMjtg&usqp=CAU',
          },
        },
      }

      const label = 'Horse Coin'

      console.log(CW20_BASE_CODE_ID, msg, label)

      const response = await contract?.instantiate(
        CW20_BASE_CODE_ID,
        msg,
        label
      )

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div>
      <div>
        <button onClick={instantiate}>Click to Instantiate</button>
        <div>{JSON.stringify(txResponse)}</div>
      </div>
    </div>
  )
}

export default CW20Base
