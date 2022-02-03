import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWallet } from 'contexts/wallet'
import useDebounce from 'utils/debounce'
import axios from 'axios'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { AirdropProps } from 'utils/constants'

const RegisterAirdrop: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)
  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string'
      ? router.query.contractAddress
      : ''
  )

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  useEffect(() => {
    if (
      router.query.contractAddress &&
      typeof router.query.contractAddress === 'string'
    )
      setContractAddress(router.query.contractAddress)
  }, [router.query])

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

  const registerMerkleDrop = () => {
    if (!airdrop) return

    setLoading(true)

    const client = wallet.getClient()

    const msg = {
      register_merkle_root: {
        merkle_root: airdrop.merkleRoot,
        start: airdrop.start ? { at_height: airdrop.start } : null,
        // start: airdrop.start ? { at_time: '1675345387' } : null, // ONE YEAR FROM NOW UNIX TIMESTAMP
        expiration: airdrop.expiration ? { at_height: airdrop.start } : null,
        // expiration: airdrop.expiration ? { at_time: '1675345387' } : null,
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
      .then((response: any) => {
        setLoading(false)
        console.log(response)
        toast.success('Mekle Root Registered', {
          style: { maxWidth: 'none' },
        })
        router.push(
          `/airdrops/fund?cw20TokenAddress=${airdrop.cw20TokenAddress}&dropAddress=${airdrop.contractAddress}`
        )
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold">Register Airdrop</h1>
      <h1 className="text-xl my-6">
        Please make sure that you create the airdrop at{' '}
        <Link href={'/create'} passHref>
          <span className="text-blue-500 cursor-pointer font-bold">here</span>
        </Link>{' '}
        and instantiate at{' '}
        <Link href={'/instantiate'} passHref>
          <span className="text-blue-500 cursor-pointer font-bold">here</span>
        </Link>{' '}
        before registering your airdrop!
      </h1>
      <div className="mb-6">
        <label className="block mb-2 text-lg font-medium text-gray-900 dark:text-gray-300">
          Contract Address
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
        onClick={registerMerkleDrop}
      >
        Register your airdrop
      </button>
    </div>
  )
}

export default RegisterAirdrop
