import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'
import { useWallet } from 'contexts/wallet'

const ClaimDrop = ({ address }: { address: string }) => {
  const router = useRouter()
  const contractAddress = address
  const wallet = useWallet()

  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [proofs, setProofs] = useState<[string]>([''])
  const [name, setName] = useState('')

  useEffect(() => {
    if (!wallet.initialized) return

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/proofs/contract/${contractAddress}/wallet/${wallet.address}`
      )
      .then(({ data }) => {
        const { account, airdrop } = data
        if (account) {
          setProofs(account.proofs)
          setAmount(account.amount.toString())
          setName(airdrop.name)
        } else {
          toast.error("You don't have any tokens to claim!")
          router.push('/airdrops')
        }
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      })
  }, [wallet.address])

  const claim = async () => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')

    setLoading(true)

    const client = wallet.getClient()

    const stage = await client.queryContractSmart(contractAddress, {
      latest_stage: {},
    })

    const msg = {
      claim: {
        amount,
        proof: proofs,
        stage: stage.latest_stage,
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

  if (!wallet.initialized) return <div>Please connect your wallet!</div>

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold text-center mb-20">{name}</h1>

      <h1 className="text-3xl font-bold text-center mb-10">
        Your drop allocation: {amount} tokens
      </h1>
      <h1 className="text-lg font-bold text-center">Your merkle proofs:</h1>
      <SyntaxHighlighter language="javascript" style={prism}>
        {`${JSON.stringify(proofs, null, 2)}`}
      </SyntaxHighlighter>
      <button
        className={`btn bg-juno border-0 btn-lg hover:bg-juno/80 font-semibold text-2xl w-full mt-4 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={claim}
      >
        Claim Drop
      </button>
      <br />
    </div>
  )
}

export async function getServerSideProps({
  params,
}: {
  params: Record<string, string>
}) {
  return { props: { address: params.address } }
}

export default ClaimDrop
