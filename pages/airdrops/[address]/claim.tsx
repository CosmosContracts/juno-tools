import React, { useEffect, useState } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import axios from 'axios'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'
import { useWallet } from 'contexts/wallet'

const ClaimDrop: NextPage = () => {
  const router = useRouter()
  const contractAddress = router.query.address as string
  const wallet = useWallet()

  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [stage, setStage] = useState(0)
  const [proofs, setProofs] = useState<[string]>([''])

  useEffect(() => {
    const client = wallet.getClient()

    if (client)
      client
        .queryContractSmart(contractAddress, { latest_stage: {} })
        .then((res) => setStage(res.latest_stage))
        .catch(console.error)
  }, [])

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/proofs/${wallet.address}`)
      .then((data) => {
        const { account } = data.data
        setProofs(account.proofs)
        setAmount(account.amount.toString())
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      })
  }, [wallet.address])

  const handleClaimMerkleDrop = () => {
    setLoading(true)

    const client = wallet.getClient()

    const msg = {
      claim: {
        amount,
        proof: proofs,
        stage,
      },
    }
    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }
    client
      .execute(wallet.address, contractAddress, msg, 'auto')
      .then((response) => {
        setLoading(false)
        console.log(response)
        toast.success('Success!', {
          style: { maxWidth: 'none' },
        })
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      })
  }

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold text-center">Airdrop Tokens</h1>

      <div className="mt-5 text-center text-lg">
        Looking for a fast and efficient way to airdrop your minted tokens or
        come to claim your allocation? <br />
        Use our airdrop tool to create/claim your tokens!
      </div>
      <h1 className="text-lg font-bold">
        Your drop allocation: {amount} tokens
      </h1>
      <h1 className="text-lg font-bold">Your merkle proofs:</h1>
      <SyntaxHighlighter language="javascript" style={prism}>
        {`${JSON.stringify(proofs, null, 2)}`}
      </SyntaxHighlighter>
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-4 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={handleClaimMerkleDrop}
      >
        Claim Drop
      </button>
      <br />
    </div>
  )
}

export default ClaimDrop
