import React, { useEffect, useState } from 'react'
import WalletLoader from 'components/WalletLoader'
import type { NextPage } from 'next'
import { CW20_MERKLE_DROP_CODE_ID } from 'utils/constants'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useWallet } from 'contexts/wallet'

const CreateDrop: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)
  const [dropName, setDropName] = useState(
    typeof router.query.name === 'string' ? router.query.name : ''
  )
  const [cw20TokenAddress, setCw20TokenAddress] = useState(
    typeof router.query.cw20TokenAddress === 'string'
      ? router.query.cw20TokenAddress
      : ''
  )
  const [dropId, setDropId] = useState(
    typeof router.query.id === 'string' ? router.query.id : ''
  )

  useEffect(() => {
    if (router.query.name && typeof router.query.name === 'string')
      setDropName(router.query.name)
    if (
      router.query.cw20TokenAddress &&
      typeof router.query.cw20TokenAddress === 'string'
    )
      setCw20TokenAddress(router.query.cw20TokenAddress)
    if (router.query.dropId && typeof router.query.dropId === 'string')
      setDropId(router.query.dropId)
  }, [router.query])

  const cw20TokenAddressOnChange = (value: string) => {
    setCw20TokenAddress(value)
  }

  const dropNameOnChange = (value: string) => {
    setDropName(value)
  }

  const instantiateMerkleDrop = async () => {
    try {
      if (dropName === '' || cw20TokenAddress === '')
        return toast.error('Please fill all empty fields!', {
          style: { maxWidth: 'none' },
        })
      setLoading(true)

      const client = wallet.getClient()

      const msg = {
        owner: wallet.address,
        cw20_token_address: cw20TokenAddress,
      }

      if (!client) {
        setLoading(false)
        return toast.error('Please try reconnecting your wallet.', {
          style: { maxWidth: 'none' },
        })
      }

      const response = await client.instantiate(
        wallet.address,
        CW20_MERKLE_DROP_CODE_ID,
        msg,
        dropName,
        'auto'
      )

      axios
        .put(`${process.env.NEXT_PUBLIC_API_URL}/airdrops`, {
          name: dropName,
          cw20TokenAddress,
          id: dropId,
          contractAddress: response.contractAddress,
        })
        .catch((err) =>
          toast.error(err.message, { style: { maxWidth: 'none' } })
        )

      Router.push({
        pathname: '/airdrops/register',
        query: {
          ...router.query,
          dropAddress: response.contractAddress,
        },
      })
      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold">Instantiate Drop</h1>
      <h1 className="text-xl my-6">
        Please make sure that you create the drop at{' '}
        <Link href={'/create'} passHref>
          <span className="text-blue-500 cursor-pointer font-bold">here</span>
        </Link>{' '}
        before instantiating your drop!
      </h1>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Your cw20 token address
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={
            cw20TokenAddress || 'Please enter your cw20 token address'
          }
          value={cw20TokenAddress}
          onChange={(e) => cw20TokenAddressOnChange(e.target.value)}
        />
      </div>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Your drop name
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={dropName || 'Please enter your drop name'}
          value={dropName}
          onChange={(e) => dropNameOnChange(e.target.value)}
        />
      </div>
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-2 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={instantiateMerkleDrop}
      >
        Instantiate Contract
      </button>
    </div>
  )
}

export default CreateDrop
