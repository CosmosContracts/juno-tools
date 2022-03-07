import { toUtf8 } from '@cosmjs/encoding'
import axios from 'axios'
import clsx from 'clsx'
import AirdropsStepper from 'components/AirdropsStepper'
import Escrow from 'components/Escrow'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import { useWallet } from 'contexts/wallet'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { AirdropProps, ESCROW_CONTRACT_ADDRESS } from 'utils/constants'
import useDebounce from 'utils/debounce'
import { withMetadata } from 'utils/layout'

const RegisterAirdropPage: NextPage = () => {
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
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Register Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold">Register Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={3} />
        </div>
        <p>
          Now that the contract is deployed, it can be registered to the
          JunoTools
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <FormControl
          title="Airdrop contract address"
          subtitle="Address of the CW20 token that will be airdropped."
          htmlId="airdrop-cw20"
        >
          <Input
            id="airdrop-cw20"
            name="cw20"
            type="text"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
          />
        </FormControl>

        {airdrop && airdrop.escrow && (
          <Escrow
            airdropContractAddress={airdrop.contractAddress}
            queryTrigger={setQueryTrigger}
            status={airdrop.escrowStatus || ''}
          />
        )}

        {airdrop && !airdrop.escrow && (
          <JsonPreview title={airdrop.name} content={airdrop} />
        )}

        <div
          className={clsx('flex justify-end pb-6', {
            'sticky right-0 bottom-0': airdrop != null && !airdrop.escrow,
          })}
        >
          <button
            disabled={loading}
            className={clsx(
              'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
              'transition hover:translate-y-[-2px]',
              {
                'opacity-50 cursor-not-allowed pointer-events-none':
                  airdrop == null,
              },
              { 'animate-pulse cursor-wait pointer-events-none': loading }
            )}
            onClick={register}
          >
            {loading ? (
              <CgSpinnerAlt className="animate-spin" />
            ) : (
              <FaAsterisk />
            )}
            <span>Register Airdrop</span>
          </button>{' '}
        </div>
      </div>
    </div>
  )
}

export default withMetadata(RegisterAirdropPage, { center: false })
