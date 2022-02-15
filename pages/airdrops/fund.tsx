import axios from 'axios'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { AirdropProps } from 'utils/constants'
import useDebounce from 'utils/debounce'

const FundAirdrop: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [transferLoading, setTransferLoading] = useState(false)
  const [mintLoading, setMintLoading] = useState(false)

  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [amount, setAmount] = useState('0')
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string'
      ? router.query.contractAddress
      : ''
  )
  const [balance, setBalance] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [denom, setDenom] = useState(null)

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  useEffect(() => {
    if (contractAddress) {
      setBalance(null)
      setTarget(null)
      setDenom(null)
      setAirdrop(null)
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}/balance`
        )
        .then(({ data }) => {
          const { balance, target, denom } = data

          setBalance(balance)
          setTarget(target)
          setAmount((target - balance).toString())
          setDenom(denom)
        })
        .catch((err: any) => {
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    } else {
      setBalance(null)
      setTarget(null)
      setDenom(null)
      setAirdrop(null)
    }
    // eslint-disable-next-line
  }, [contractAddressDebounce])

  useEffect(() => {
    if (contractAddress) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`
        )
        .then(({ data }) => {
          const { airdrop } = data
          setAirdrop(airdrop)
        })
        .catch((err: any) => {
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    } else setAirdrop(null)
    // eslint-disable-next-line
  }, [contractAddressDebounce])

  useEffect(() => {
    if (
      router.query.dropAddress &&
      typeof router.query.dropAddress === 'string'
    )
      setContractAddress(router.query.dropAddress)
  }, [router.query])

  const fund = (executeType: string) => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')
    if (!airdrop) return
    if (airdrop.processing)
      return toast.error('Airdrop is being processed.\n Check back later!')

    if (executeType === 'transfer') setTransferLoading(true)
    else setMintLoading(true)

    const client = wallet.getClient()

    const msg = {
      [`${executeType}`]: {
        amount: amount.toString(),
        recipient: contractAddress,
      },
    }

    if (!client) {
      setTransferLoading(false)
      setMintLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    client
      .execute(wallet.address, airdrop.cw20TokenAddress, msg, 'auto')
      .then(() => {
        setTransferLoading(false)
        setMintLoading(false)
        toast.success('Airdrop funded!', {
          style: { maxWidth: 'none' },
        })
        axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
          { status: 'funded' }
        )
      })
      .catch((err: any) => {
        setTransferLoading(false)
        setMintLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="w-3/4 h-4/4">
      <h1 className="mb-6 text-6xl font-bold text-center">Fund Airdrop</h1>
      {balance === null ? (
        <div className="my-5 text-xl font-bold text-center">
          Enter airdrop contract address to see stats
        </div>
      ) : (
        <div className="flex">
          <div className="my-1 text-2xl">
            Total airdrop amount:{' '}
            <span className="font-bold">
              {target} {denom}
            </span>
          </div>
          <div className="my-1 text-2xl">
            Current contract balance:{' '}
            <span className="font-bold">
              {balance} {denom}
            </span>
          </div>
          <div className="my-1 mb-6 text-2xl">
            Total amount needed:{' '}
            <span className="font-bold">
              {target && balance ? target - balance : ''} {denom}
            </span>
          </div>
        </div>
      )}
      <div className="mb-6">
        <label className="block mb-2 text-lg font-bold text-center text-gray-900 dark:text-gray-300">
          Airdrop Contract Address
        </label>
        <input
          type="text"
          className="block p-2.5 w-full text-lg text-black rounded-lg border focus:border-blue-500 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 bg-gray-50 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
          placeholder={
            contractAddress || 'Please enter your airdrop contract address'
          }
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>
      {airdrop && (
        <SyntaxHighlighter language="javascript" style={prism}>
          {JSON.stringify(airdrop, null, 2)}
        </SyntaxHighlighter>
      )}
      {denom && (
        <div className="flex justify-evenly">
          <button
            className={`btn bg-juno border-0 btn-lg font-semibold hover:bg-juno/80 text-2xl w-2/5 mt-2 ${
              transferLoading ? 'loading' : ''
            }`}
            style={{ cursor: transferLoading ? 'not-allowed' : 'pointer' }}
            disabled={transferLoading || mintLoading}
            onClick={() => fund('transfer')}
          >
            Fund With Transfer
          </button>
          <button
            className={`btn bg-juno border-0 btn-lg font-semibold hover:bg-juno/80 text-2xl w-2/5 mt-2 ${
              mintLoading ? 'loading' : ''
            }`}
            style={{ cursor: mintLoading ? 'not-allowed' : 'pointer' }}
            disabled={transferLoading || mintLoading}
            onClick={() => fund('mint')}
          >
            Fund With Mint
          </button>
        </div>
      )}
    </div>
  )
}

export default FundAirdrop
