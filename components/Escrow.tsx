import { coin } from '@cosmjs/proto-signing'
import axios from 'axios'
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
  status,
}: {
  airdropContractAddress: string
  queryTrigger: (status: boolean) => void
  status: string
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
        axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${airdropContractAddress}`,
          { escrowStatus: 'processing' }
        )
        setTimeout(() => {
          queryTrigger(true)
        }, 1500)
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  /* TODO: Here we can use a loading spinner for the user */
  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center text-2xl text-center">
        <div>Your escrow deposit is being processed!</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-2xl text-center">
      <div>Your airdrop is waiting for your escrow deposit!</div>
      <div className="my-3">
        Click the button below to deposit {ESCROW_AMOUNT} juno for escrow
      </div>
      <button
        onClick={deposit}
        className={`p-3 w-fit font-bold bg-juno rounded-lg border border-juno ${
          loading && 'opacity-50'
        }`}
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
