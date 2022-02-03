import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import useDebounce from 'utils/debounce'
import axios from 'axios'
import { useWallet } from 'contexts/wallet'
import { AirdropProps } from 'utils/constants'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'

const FundAirdrop: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)

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
          setLoading(false)
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
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
          setLoading(false)
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

  const fund = () => {
    if (!airdrop) return

    setLoading(true)

    const client = wallet.getClient()

    const msg = {
      transfer: {
        amount: amount.toString(),
        recipient: contractAddress,
      },
    }

    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    client
      .execute(wallet.address, airdrop.cw20TokenAddress, msg, 'auto')
      .then((response: any) => {
        setLoading(false)
        console.log(response)
        toast.success('Success!', {
          style: { maxWidth: 'none' },
        })
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold mb-6">Fund Airdrop</h1>
      {balance === null ? (
        <div className="text-xl font-bold my-5">
          Enter airdrop contract address to see stats
        </div>
      ) : (
        <>
          <div className="text-2xl my-1">
            Total airdrop amount:{' '}
            <span className="font-bold">
              {target} {denom}
            </span>
          </div>
          <div className="text-2xl my-1">
            Current contract balance:{' '}
            <span className="font-bold">
              {balance} {denom}
            </span>
          </div>
          <div className="text-2xl my-1 mb-6">
            Total amount needed:{' '}
            <span className="font-bold">
              {target && balance ? target - balance : ''} {denom}
            </span>
          </div>
        </>
      )}
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Airdrop Contract Address
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-black text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-2 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={fund}
      >
        Fund airdrop
      </button>
    </div>
  )
}

export default FundAirdrop
