import { coin } from '@cosmjs/proto-signing'
import axios from 'axios'
import AirdropsStepper from 'components/AirdropsStepper'
import Anchor from 'components/Anchor'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import { getConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  AirdropProps,
  ESCROW_AMOUNT,
  ESCROW_CONTRACT_ADDRESS,
} from 'utils/constants'
import useDebounce from 'utils/debounce'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const EscrowAirdropPage: NextPage = () => {
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
  }, [contractAddressDebounce])

  const deposit = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')

      const config = getConfig(wallet.network)

      setLoading(true)

      const client = wallet.getClient()

      if (!client) {
        setLoading(false)
        return toast.error('Please try reconnecting your wallet.', {
          style: { maxWidth: 'none' },
        })
      }

      await client.execute(
        wallet.address,
        ESCROW_CONTRACT_ADDRESS,
        {
          lock_funds: {
            airdrop_addr: contractAddress,
          },
        },
        'auto',
        '',
        [coin(ESCROW_AMOUNT * 1000000, config.feeToken)]
      )
      setLoading(false)
      toast.success('Deposit successful!')
      axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        { escrowStatus: 'processing' }
      )
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Airdrop Escrow" />

      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold">Airdrop Escrow</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={2} />
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
      </div>

      {airdrop && airdrop.escrow && (
        <>
          {airdrop.escrowStatus === 'waiting' && (
            <div className="flex flex-col items-center text-2xl text-center">
              <div>Your airdrop is waiting for your escrow deposit!</div>
              <div className="my-3">
                Click the button below to deposit {ESCROW_AMOUNT} juno for
                escrow
              </div>
              <button
                onClick={deposit}
                className={`p-3 w-fit font-bold bg-juno rounded-lg border border-juno ${
                  loading && 'opacity-50'
                }`}
                style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
                disabled={loading}
              >
                Deposit Escrow
              </button>
              <div className="mt-10 text-lg">
                You can read more about the escrow process on our{' '}
                <Anchor
                  href={links.Docs}
                  className="font-bold text-plumbus-40 hover:underline"
                >
                  documentation
                </Anchor>
              </div>
            </div>
          )}
          {airdrop.escrowStatus === 'processing' && (
            <div className="flex flex-col items-center text-2xl text-center">
              <div>Your escrow deposit is being processed!</div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default withMetadata(EscrowAirdropPage, { center: false })
