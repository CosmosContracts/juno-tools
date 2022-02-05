import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { TESTNET_CW20_BASE_CODE_ID } from 'utils/constants'

const CW20Base = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

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
        initial_balances: [
          {
            address: wallet.address,
            amount: '10000000',
          },
        ],
        //Optional
        mint: {
          minter: wallet.address,
          // cap: '1000000000', // Optional
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

      const response = await contract?.instantiate(
        TESTNET_CW20_BASE_CODE_ID,
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
        'juno12pwnhtv7yat2s30xuf4gdk9qm85v4j3e6p44let47pdffpklcxlqks6cz7'
      )

      // Balance
      // const response = await messages?.balance(wallet.address)

      // Allowance
      // const response = await messages?.allowance(wallet.address, wallet.address)

      // All Allowances
      // const response = await messages?.allAllowances(wallet.address)

      // All Accounts
      // const response = await messages?.allAccounts()

      // Token Info
      // const response = await messages?.tokenInfo()

      // Minter Info
      // const response = await messages?.minter()

      // Marketing Info
      const response = await messages?.marketingInfo()

      setTxResponse(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const messages = contract?.use(
        'juno1hjffvkrvelxsx9ha5usmv4zdapl6rw6tf5phdyjq7dunsxgpa5cs28pwfm'
      )

      // Mint
      // const response = await messages?.mint(
      //   wallet.address,
      //   wallet.address,
      //   '1000000'
      // )

      // Transfer
      // const response = await messages?.transfer(
      //   wallet.address,
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt',
      //   '1000000'
      // )

      // Burn
      // const response = await messages?.burn(wallet.address, '5000')

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

      // Update Marketing
      // const response = await messages?.updateMarketing(
      //   wallet.address,
      //   'Horse Project Version 2',
      //   'Horses are cool, really cool',
      //   'juno14wu56uyj9hw68x3mltxd2jl0298v4stg3qfcjt'
      // )

      // Update logo
      const response = await messages?.uploadLogo(wallet.address, {
        url: 'https://t4.ftcdn.net/jpg/01/93/63/75/360_F_193637522_tqfgy9otngxvJok2wzoEgAfgvdh4AzZt.jpg',
      })

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

export default CW20Base
