import React, { useState, useEffect } from 'react'
import WalletLoader from 'components/WalletLoader'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast'
import useDebounce from 'utils/debounce'
import axios from 'axios'
import { useWallet } from 'contexts/wallet'

const Fund: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)

  const [amount, setAmount] = useState('0')
  const [cw20Address, setCw20Address] = useState(router.query.cw20TokenAddress)
  const [dropAddress, setDropAddress] = useState(router.query.dropAddress)
  const [balance, setBalance] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)

  const dropAddressDebounce = useDebounce(dropAddress, 500)

  useEffect(() => {
    if (dropAddress) {
      setBalance(null)
      setTarget(null)
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/fund/${dropAddress}`
        )
        .then((data) => {
          const { balance, target } = data.data

          setBalance(balance)
          setTarget(target)
          setAmount((target - balance).toString())
        })
        .catch((err: any) => {
          setLoading(false)
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    }
    // eslint-disable-next-line
  }, [dropAddressDebounce])

  useEffect(() => {
    if (
      router.query.cw20TokenAddress &&
      typeof router.query.cw20TokenAddress === 'string'
    )
      setCw20Address(router.query.cw20TokenAddress)
    if (
      router.query.dropAddress &&
      typeof router.query.dropAddress === 'string'
    )
      setDropAddress(router.query.dropAddress)
  }, [router.query])

  const fundMerkleDrop = () => {
    setLoading(true)

    const client = wallet.getClient()

    const msg = {
      transfer: {
        amount: amount.toString(),
        recipient: dropAddress,
      },
    }

    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    client
      .execute(wallet.address, cw20Address as string, msg, 'auto')
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
      <h1 className="text-6xl font-bold mb-6">Fund Drop</h1>
      {balance === null ? (
        <div className="text-xl font-bold my-5">
          Enter drop contract address to see stats
        </div>
      ) : (
        <>
          <div className="text-2xl my-1">
            Current contract balance:{' '}
            <span className="font-bold">{balance}</span>
          </div>
          <div className="text-2xl my-1">
            Total airdrop amount: <span className="font-bold">{target}</span>
          </div>
          <div className="text-2xl my-1 mb-6">
            Total amount needed:{' '}
            <span className="font-bold">
              {target && balance ? target - balance : ''}
            </span>
          </div>
        </>
      )}
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Amount
        </label>
        <input
          type="number"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          CW20 Token Contract Address
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={cw20Address}
          onChange={(e) => setCw20Address(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Drop Contract Address
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={dropAddress}
          onChange={(e) => setDropAddress(e.target.value)}
        />
      </div>
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-2 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={fundMerkleDrop}
      >
        Fund drop
      </button>
    </div>
  )
}

export default Fund
