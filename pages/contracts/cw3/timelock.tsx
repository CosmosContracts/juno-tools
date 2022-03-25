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
  const CONTRACT_ADDRESS =
    'juno17cjuw3a25qwd5ms6ty2f8jrtecx88du08k0w2480quuupqncu4sq646kmh'

  const instantiate = async () => {
    try {
      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }
      const response = await contract.instantiate(
        626,
        {
          admins: [
            'juno1smz9wdg5v7wywquyy7zn7ujvu54kuumwzw5ss8',
            'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74',
            'juno169rrmm8vkdhaalaq7pgpl2xy7qx338h0pmpm8t',
          ],
          proposers: [
            'juno1smz9wdg5v7wywquyy7zn7ujvu54kuumwzw5ss8',
            'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74',
            'juno169rrmm8vkdhaalaq7pgpl2xy7qx338h0pmpm8t',
          ],
          min_delay: '10000000000',
        },
        'Timelock Test',
        wallet.address
      )

      console.log(response)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const query = async () => {
    try {
      const client = contract?.use(CONTRACT_ADDRESS)
      const response = await client?.getAdmins()
      console.log('getAdmins', response)

      const response2 = await client?.getOperations()
      console.log('getOperations', response2)

      const response3 = await client?.getMinDelay()
      console.log('getMinDelay', response3)

      let operation_id = ''
      const response4 = await client?.getExecutionTime(operation_id)
      console.log('getExecutionTime', response4)

      const response5 = await client?.getOperationStatus(operation_id)
      console.log('getOperation', response5)
    } catch (error: any) {
      toast.error(error.message, { style: { maxWidth: 'none' } })
    }
  }

  const execute = async () => {
    try {
      const client = contract?.use(CONTRACT_ADDRESS)
      console.log(client)

      let operation_id = 1
      const res1 = await client?.cancel(wallet.address, operation_id)
      console.log('cancel', res1)

      const res2 = await client?.addProposer(
        wallet.address,
        'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74'
      )
      console.log('addProposer', res2)

      const res3 = await client?.removeProposer(
        wallet.address,
        'juno1dc5yv2w2plccmxxh6szden8kqkshqjgkeqkg74'
      )
      console.log('removeProposer', res3)

      const res4 = await client?.execute(wallet.address, operation_id)
      console.log('execute', res4)

      const res5 = await client?.updateMinDelay(10000000000, wallet.address)
      console.log('updateMinDelay', res5)

      //   revokeAdmin: (senderAddress: string, admin_address: string) => Promise<any>
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
