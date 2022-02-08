import React, { useState, useEffect } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
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

  const register = () => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')
    if (!airdrop) return
    if (airdrop.processing)
      return toast.error('Airdrop is being processed.\n Check back later!')

    setLoading(true)

    const client = wallet.getClient()

    const start = airdrop.start
      ? airdrop.startType === 'height'
        ? { at_height: airdrop.start }
        : { at_time: (airdrop.start + 1000000000).toString() }
      : null
    const expiration = airdrop.expiration
      ? airdrop.expirationType === 'height'
        ? { at_height: airdrop.expiration }
        : { at_time: (airdrop.expiration + 1000000000).toString() }
      : null

    const msg = {
      register_merkle_root: {
        merkle_root: airdrop.merkleRoot,
        start,
        expiration,
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
      .then(() => {
        setLoading(false)
        toast.success('Airdrop Registered', {
          style: { maxWidth: 'none' },
        })
        router.push(
          `/airdrops/fund?cw20TokenAddress=${airdrop.cw20TokenAddress}&dropAddress=${airdrop.contractAddress}`
        )
        axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
          { status: 'registered' }
        )
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, { style: { maxWidth: 'none' } })
      })
  }

  return (
    <div className="h-4/4 w-3/4">
      <h1 className="text-6xl font-bold text-center">Register Airdrop</h1>
      <div className="my-6">
        <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300 text-center">
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
      {airdrop && (
        <button
          className={`btn bg-juno border-0 btn-lg font-semibold hover:bg-juno/80 text-2xl w-full mt-2 ${
            loading ? 'loading' : ''
          }`}
          style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          disabled={loading}
          onClick={register}
        >
          Register your airdrop
        </button>
      )}
    </div>
  )
}

export default RegisterAirdrop
