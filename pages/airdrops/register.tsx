import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWallet } from 'contexts/wallet'

const CreateDrop: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)
  const [cw20Address, setCw20Address] = useState(
    typeof router.query.cw20TokenAddress === 'string'
      ? router.query.cw20TokenAddress
      : ''
  )
  const [merkleRoot, setMerkleRoot] = useState(
    typeof router.query.merkleRoot === 'string' ? router.query.merkleRoot : ''
  )
  const [dropAddress, setDropAddress] = useState(
    typeof router.query.dropAddress === 'string' ? router.query.dropAddress : ''
  )
  const [start, setStart] = useState(
    typeof router.query.start === 'string' ? router.query.start : ''
  )
  const [expiration, setExpiration] = useState(
    typeof router.query.expiration === 'string' ? router.query.expiration : ''
  )
  const [totalAmount, setTotalAmount] = useState(
    typeof router.query.totalAmount === 'string' ? router.query.totalAmount : ''
  )

  useEffect(() => {
    if (router.query.merkleRoot && typeof router.query.merkleRoot === 'string')
      setMerkleRoot(router.query.merkleRoot)
    if (
      router.query.dropAddress &&
      typeof router.query.dropAddress === 'string'
    )
      setDropAddress(router.query.dropAddress)
    if (
      router.query.cw20TokenAddress &&
      typeof router.query.cw20TokenAddress === 'string'
    )
      setCw20Address(router.query.cw20TokenAddress)

    if (router.query.start && typeof router.query.start === 'string')
      setStart(router.query.start)

    if (router.query.expiration && typeof router.query.expiration === 'string')
      setExpiration(router.query.expiration)

    if (
      router.query.totalAmount &&
      typeof router.query.totalAmount === 'string'
    )
      setTotalAmount(router.query.totalAmount)
  }, [router.query])

  const registerMerkleDrop = () => {
    // This will be the toast
    if (merkleRoot === '' || dropAddress === '' || totalAmount === '')
      return toast.error('Please fill all empty fields!')

    setLoading(true)

    const client = wallet.getClient()

    const msg = {
      register_merkle_root: {
        merkle_root: merkleRoot,
        start: start || null,
        expiration: expiration || null,
        total_amount: totalAmount,
      },
    }

    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    client
      .execute(wallet.address, dropAddress as string, msg, 'auto')
      .then((response: any) => {
        setLoading(false)
        console.log(response)
        toast.success('Mekle Root Registered', {
          style: { maxWidth: 'none' },
        })
        router.push(
          `/airdrops/fund?cw20TokenAddress=${cw20Address}&dropAddress=${dropAddress}`
        )
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold">Register Drop</h1>
      <h1 className="text-xl my-6">
        Please make sure that you create the drop at{' '}
        <Link href={'/create'} passHref>
          <span className="text-blue-500 cursor-pointer font-bold">here</span>
        </Link>{' '}
        and instantiate at{' '}
        <Link href={'/instantiate'} passHref>
          <span className="text-blue-500 cursor-pointer font-bold">here</span>
        </Link>{' '}
        before registering your drop!
      </h1>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Merkle root
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={merkleRoot || 'Please enter merkle root for drop'}
          value={merkleRoot}
          onChange={(e) => setMerkleRoot(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Drop contract address
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={dropAddress || 'Please enter contract address for drop '}
          value={dropAddress}
          onChange={(e) => setDropAddress(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Total drop amount
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={totalAmount || 'Please enter total drop amount'}
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Drop start block height
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={
            start || 'Please enter start block height (default null)'
          }
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Drop end height
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={
            expiration || 'Please enter end block height (default null)'
          }
          value={expiration}
          onChange={(e) => setExpiration(e.target.value)}
        />
      </div>
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-2 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={registerMerkleDrop}
      >
        Register your drop
      </button>
    </div>
  )
}

export default CreateDrop
