import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { CW20_BONDING_CODE_ID } from 'utils/constants'

const CW20Bonding = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Bonding

  const [txResponse, setTxResponse] = useState<any>()

  const instantiate = async () => {
    try {
      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }

      const msg = {
        name: 'Horse Coin',
        symbol: 'HORSE',
        decimals: 6,
        reserve_denom: 'ujunox',
        reserve_decimals: 6,
        curve_type: {
          constant: {
            value: '1',
            scale: 1,
          },
        },
        // curve_type: {
        //   linear: {
        //     slope: '1',
        //     scale: 1
        //   }
        // },
        // curve_type: {
        //   square_root: {
        //     slope: '1',
        //     scale: 1
        //   }
        // },
      }

      const label = 'Horse Coin'

      const response = await contract.instantiate(CW20_BONDING_CODE_ID, msg, label, wallet.address)

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const query = async () => {
    try {
      const messages = contract?.use('juno1w6tdxsk75uv97rundwrg64qv30hrnmhj2x76cz25p55h69res0vqacvfqx')

      // Balance
      const response = await messages?.balance(wallet.address)

      // Allowance
      // const response = await messages?.allowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt'
      // )

      // Token Info
      // const response = await messages?.tokenInfo()

      // Curve Info
      // const response = await messages?.curveInfo()

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const messages = contract?.use('juno1w6tdxsk75uv97rundwrg64qv30hrnmhj2x76cz25p55h69res0vqacvfqx')

      // Buy
      const response = await messages?.buy(wallet.address, '5000')

      // Transfer
      // const response = await messages?.transfer(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '1000'
      // )

      // Burn
      // const response = await messages?.burn(wallet.address, '5000')

      // Increase Allowance
      // const response = await messages?.increaseAllowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '3000'
      // )

      // Decrease Allowance
      // const response = await messages?.decreaseAllowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '4000'
      // )

      // Transfer From // TODO: Try again
      // const response = await messages?.transferFrom(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   wallet.address,
      //   '5000'
      // )

      // Send From // TODO: Try again
      // const response = await messages?.sendFrom(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   wallet.address,
      //   '5000',
      //   {}
      // )

      // Burn From // TODO: Try again
      // const response = await messages?.burnFrom(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '5000'
      // )

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div>
      <div className="flex flex-col">
        <button className="p-3 bg-red-400 rounded-lg" onClick={void instantiate} type="button">
          Click to Instantiate
        </button>
        <button className="p-3 bg-blue-400 rounded-lg" onClick={void query} type="button">
          Click to Query
        </button>
        <button className="p-3 bg-green-400 rounded-lg" onClick={void execute} type="button">
          Click to Execute
        </button>
        <div>{JSON.stringify(txResponse)}</div>
      </div>
    </div>
  )
}

export default CW20Bonding
