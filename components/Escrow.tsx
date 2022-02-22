import { coin } from '@cosmjs/proto-signing'
import { getConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ESCROW_AMOUNT, ESCROW_CONTRACT_ADDRESS } from 'utils/constants'
import { links } from 'utils/links'

import Anchor from './Anchor'

const Escrow = ({
  airdropContractAddress,
  queryTrigger,
}: {
  airdropContractAddress: string
  queryTrigger: (status: boolean) => void
}) => {
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)

  const deposit = () => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')

    const config = getConfig(wallet.network)

    setLoading(true)

    const client = wallet.getClient()

    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    client
      .execute(
        wallet.address,
        ESCROW_CONTRACT_ADDRESS,
        {
          lock_funds: {
            airdrop_addr: airdropContractAddress,
          },
        },
        'auto',
        '',
        [coin(ESCROW_AMOUNT * 1000000, config.feeToken)]
      )
      .then(() => {
        setLoading(false)
        toast.success('Deposit successful!')
        setTimeout(() => {
          queryTrigger(true)
        }, 1000)
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="flex flex-col items-center text-2xl text-center">
      <div>Your airdrop is waiting for your escrow deposit!</div>
      <div className="my-3">
        Click the button below to deposit {ESCROW_AMOUNT} juno for escrow
      </div>
      <button
        onClick={deposit}
        className="p-3 w-fit font-bold bg-juno rounded-lg border border-juno"
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
      >
        Deposit Escrow
      </button>
      <div className="mt-10 text-lg">
        You can read more about the escrow process on our{' '}
        <Anchor
          href={links.Docs}
          className="font-bold text-plumbus-40 hover:underline"
        >
          documentation
        </Anchor>
      </div>
    </div>
  )
}

export default Escrow
