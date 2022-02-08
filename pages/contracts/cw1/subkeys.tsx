import { coin } from '@cosmjs/proto-signing'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  MAINNET_CW1_SUBKEYS_CODE_ID,
  TESTNET_CW1_SUBKEYS_CODE_ID,
} from 'utils/constants'

const CW1Subkeys = () => {
  const wallet = useWallet()
  const contract = useContracts().cw1Subkeys

  const [txResponse, setTxResponse] = useState<any>()

  const instantiate = async () => {
    try {
      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }

      const msg = {
        admins: ['juno10s2uu9264ehlql5fpyrh9undnl5nlaw63td0hh'],
        mutable: true,
      }

      const label = 'Test CW1 Subkeys Contract'

      const response = await contract?.instantiate(
        wallet.network === 'mainnet'
          ? MAINNET_CW1_SUBKEYS_CODE_ID
          : TESTNET_CW1_SUBKEYS_CODE_ID,
        msg,
        label,
        wallet.address
      )

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const query = async () => {
    try {
      const messages = contract?.use(
        'juno1v2cvdqa52en2596q8fzgg6ygg267zqc36awhk8d5685su6esa5kq4cw3vt'
      )

      // Balance
      //   const response = await messages?.admins()

      // Allowance
      //   const response = await messages?.allowance(wallet.address)

      // All Allowances
      const response = await messages?.allAllowances()

      // Permissions
      //   const response = await messages?.permissions(wallet.address)

      // All Permissions
      //   const response = await messages?.allPermissions()

      // Can Execute - Send Message
      //   const response = await messages?.canExecute(wallet.address, {
      //     bank: {
      //       send: {
      //         from_address: messages.contractAddress,
      //         to_address: wallet.address,
      //         amount: [coin(1000000, 'ujunox')],
      //       },
      //     },
      //   })

      // Can Execute - Delegate Message
      //   const response = await messages?.canExecute(wallet.address, {
      //     staking: {
      //       delegate: {
      //         validator: 'junovaloper1t8ehvswxjfn3ejzkjtntcyrqwvmvuknzmvtaaa',
      //         amount: coin(1000000, 'ujunox'),
      //       },
      //     },
      //   })

      // Can Execute - Undelegate Message
      //   const response = await messages?.canExecute(wallet.address, {
      //     staking: {
      //       undelegate: {
      //         validator: 'junovaloper1t8ehvswxjfn3ejzkjtntcyrqwvmvuknzmvtaaa',
      //         amount: coin(1000000, 'ujunox'),
      //       },
      //     },
      //   })

      // Can Execute - Redelegate Message
      //   const response = await messages?.canExecute(wallet.address, {
      //     staking: {
      //       redelegate: {
      //         src_validator: 'junovaloper1t8ehvswxjfn3ejzkjtntcyrqwvmvuknzmvtaaa',
      //         dst_validator: 'junovaloper1t8ehvswxjfn3ejzkjtntcyrqwvmvuknzmvtaaa',
      //         amount: coin(1000000, 'ujunox'),
      //       },
      //     },
      //   })

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const messages = contract?.use(
        'juno1v2cvdqa52en2596q8fzgg6ygg267zqc36awhk8d5685su6esa5kq4cw3vt'
      )

      // Update Admins
      const response = await messages?.updateAdmins(wallet.address, [
        'juno10s2uu9264ehlql5fpyrh9undnl5nlaw63td0hh',
      ])

      // Freeze
      //   const response = await messages?.freeze(wallet.address)

      // Increase Allowance
      //   const response = await messages?.increaseAllowance(
      //     wallet.address,
      //     'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //     coin(1000000, 'ujunox')
      //   )

      // Decrease Allowance
      //   const response = await messages?.decreaseAllowance(
      //     wallet.address,
      //     'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //     coin(1000000, 'ujunox')
      //   )

      // Send Tokens
      //   const response = await messages?.execute(wallet.address, [
      //     {
      //       bank: {
      //         send: {
      //           from_address: messages.contractAddress,
      //           to_address: wallet.address,
      //           amount: [coin(1000000, 'ujunox')],
      //         },
      //       },
      //     },
      //   ])

      // Increase Allowance
      // const response = await messages?.increaseAllowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '10000000'
      // )

      // Decrease Allowance
      // const response = await messages?.decreaseAllowance(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '10000000'
      // )

      // Set Permissions
      //   const response = await messages?.setPermissions(
      //     wallet.address,
      //     'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //     {
      //       withdraw: true,
      //       delegate: true,
      //       undelegate: true,
      //       redelegate: true,
      //     }
      //   )

      setTxResponse(response)
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

export default CW1Subkeys
