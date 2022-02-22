import { toUtf8 } from '@cosmjs/encoding'
import axios from 'axios'
import Escrow from 'components/Escrow'
import { useWallet } from 'contexts/wallet'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { AirdropProps, ESCROW_CONTRACT_ADDRESS } from 'utils/constants'
import useDebounce from 'utils/debounce'

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
  const [queryTrigger, setQueryTrigger] = useState(false)

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  useEffect(() => {
    if (
      router.query.contractAddress &&
      typeof router.query.contractAddress === 'string'
    )
      setContractAddress(router.query.contractAddress)
  }, [router.query])

  useEffect(() => {
    if (contractAddress !== '') {
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
  }, [contractAddressDebounce, queryTrigger])

  const register = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!airdrop) return
      if (airdrop.processing)
        return toast.error('Airdrop is being processed.\n Check back later!')

      setLoading(true)

      const client = wallet.getClient()

      const start = airdrop.start
        ? airdrop.startType === 'height'
          ? { at_height: airdrop.start }
          : { at_time: (airdrop.start * 1000000000).toString() }
        : null
      const expiration = airdrop.expiration
        ? airdrop.expirationType === 'height'
          ? { at_height: airdrop.expiration }
          : { at_time: (airdrop.expiration * 1000000000).toString() }
        : null

      if (!client) {
        setLoading(false)
        return toast.error('Please try reconnecting your wallet.', {
          style: { maxWidth: 'none' },
        })
      }

      const stage = await client.queryContractSmart(contractAddress, {
        latest_stage: {},
      })

      await client.signAndBroadcast(
        wallet.address,
        [
          // Airdrop contract register message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: wallet.address,
              contract: contractAddress,
              msg: toUtf8(
                JSON.stringify({
                  register_merkle_root: {
                    merkle_root: airdrop.merkleRoot,
                    start,
                    expiration,
                  },
                })
              ),
            }),
          },
          // Escrow contract release message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: wallet.address,
              contract: ESCROW_CONTRACT_ADDRESS,
              msg: toUtf8(
                JSON.stringify({
                  release_locked_funds: {
                    airdrop_addr: contractAddress,
                    stage: stage.latest_stage,
                  },
                })
              ),
            }),
          },
        ],
        'auto'
      )

      setLoading(false)
      toast.success('Airdrop registered and escrow released', {
        style: { maxWidth: 'none' },
      })
      router.push(`/airdrops/fund?contractAddress=${airdrop.contractAddress}`)
      axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        { status: 'registered' }
      )
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div className="w-3/4 h-4/4">
      <NextSeo title="Register Airdrop" />
      <h1 className="text-6xl font-bold text-center">Register Airdrop</h1>
      <div className="my-6">
        <label className="block mb-2 text-lg font-bold text-gray-300">
          Airdrop Contract Address
        </label>
        <input
          type="text"
          className="block p-2.5 w-full text-lg text-black bg-gray-50 rounded-lg border border-gray-300 focus:border-blue-500 dark:border-gray-600 dark:focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500 dark:placeholder-gray-400"
          placeholder={
            contractAddress || 'Please enter your airdrop contract address'
          }
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
        />
      </div>
      {airdrop && (
        <>
          {airdrop.escrow ? (
            <Escrow
              airdropContractAddress={airdrop.contractAddress}
              queryTrigger={setQueryTrigger}
            />
          ) : (
            <>
              <SyntaxHighlighter language="javascript" style={prism}>
                {JSON.stringify(airdrop, null, 2)}
              </SyntaxHighlighter>
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
            </>
          )}
        </>
      )}
    </div>
  )
}

export default RegisterAirdrop
