import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { CW20_STAKING_CODE_ID } from 'utils/constants'

const CW20Staking = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Staking

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
        validator: 'junovaloper1xatlczsqz2vfwzxwv5try4pxprazveg4cyle50',
        unbonding_period: {
          height: 1000000,
        },
        // unbounding_period: {
        //   time: '1000000'
        // },
        exit_tax: '0.025',
        min_withdrawal: '1000',
      }

      const label = 'Horse Coin'

      const response = await contract.instantiate(CW20_STAKING_CODE_ID, msg, label, wallet.address)

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const query = async () => {
    try {
      const messages = contract?.use('juno1q8y56lulqlkds83uvsh3cw044rspk42mem7mnnmdljgscv0vm5rqur4ss7')

      // Balance
      // const response = await messages?.balance(wallet.address)

      // Claims
      // const response = await messages?.claims(wallet.address)

      // Investment
      const response = await messages?.investment()

      // Allowance
      // const response = await messages?.allowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt'
      // )

      // Token Info
      // const response = await messages?.tokenInfo()

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const messages = contract?.use('juno1q8y56lulqlkds83uvsh3cw044rspk42mem7mnnmdljgscv0vm5rqur4ss7')

      // Bond
      const response = await messages?.bond(wallet.address, '5000')

      // Unbond
      // const response = await messages?.unbond(wallet.address, '2000')

      // Claim
      // const response = await messages?.claim(wallet.address)

      // Reinvest
      // const response = await messages?.reinvest(wallet.address)

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

export default CW20Staking
