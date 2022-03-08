import axios from 'axios'
import clsx from 'clsx'
import AirdropsStepper from 'components/AirdropsStepper'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import Radio from 'components/Radio'
import Stats from 'components/Stats'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { AirdropProps } from 'utils/constants'
import useDebounce from 'utils/debounce'
import { withMetadata } from 'utils/layout'

const FUND_RADIO_VALUES = [
  {
    id: 'transfer',
    title: `Transfer`,
    subtitle: `Anyone with the airdrop address can fund it if they have the balance.`,
  },
  {
    id: 'mint',
    title: `Mint`,
    subtitle: `Only the creator and the minter of the token can fund the airdrop directly from minting.\nAfter the airdrop is funded and the start time/block has passed, the airdrop will be claimable.`,
  },
] as const

type FundMethod = typeof FUND_RADIO_VALUES[number]['id']

const FundAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const contract = useContracts().cw20Base

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
  const [denom, setDenom] = useState<string | null>(null)
  const [queryTrigger, setQueryTrigger] = useState(false)

  const [method, setMethod] = useState<FundMethod>('transfer')

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  useEffect(() => {
    if (contractAddress !== '') {
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

          const needed = target - balance

          setBalance(balance)
          setTarget(target)
          setAmount(needed < 0 ? '0' : needed.toString())
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
  }, [contractAddressDebounce, queryTrigger])

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
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    } else setAirdrop(null)
    // eslint-disable-next-line
  }, [contractAddressDebounce, queryTrigger])

  useEffect(() => {
    if (
      router.query.contractAddress &&
      typeof router.query.contractAddress === 'string'
    )
      setContractAddress(router.query.contractAddress)
  }, [router.query])

  const fund = async (executeType: string) => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing)
        return toast.error('Airdrop is being processed.\n Check back later!')

      if (executeType === 'transfer') {
        setTransferLoading(true)
        await contract
          .use(airdrop.cw20TokenAddress)
          ?.transfer(wallet.address, contractAddress, amount.toString())
      } else {
        setMintLoading(true)
        await contract
          .use(airdrop.cw20TokenAddress)
          ?.mint(wallet.address, contractAddress, amount.toString())
      }

      setTransferLoading(false)
      setMintLoading(false)

      toast.success('Airdrop funded!', {
        style: { maxWidth: 'none' },
      })
      axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        { status: 'funded' }
      )
    } catch (err: any) {
      setTransferLoading(false)
      setMintLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }
  const loading = transferLoading || mintLoading

  return (
    <section className="relative py-6 px-12 space-y-8">
      <NextSeo title="Fund Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Fund Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={4} />
        </div>
        <p>Fund your registered airdrop via transfer or via mint</p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <FormControl
          title="Airdrop contract address"
          subtitle="Address of the CW20 token that will be funded"
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

        {airdrop && !airdrop.escrow && (
          <FormControl
            title="Airdrop details"
            subtitle="View current airdrop amount, contract balance, and other information"
          >
            <div className="grid grid-cols-3 gap-4 pb-2">
              <Stats title="Total amount">
                {balance ? (
                  <>
                    {target} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Contract balance">
                {balance ? (
                  <>
                    {balance} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Amount needed">
                {target && balance ? (
                  <>
                    {amount} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
            </div>

            {/*
            <JsonPreview
              title={airdrop?.name ?? 'Airdrop Metadata'}
              content={airdrop ?? {}}
            />
            */}
          </FormControl>
        )}

        {airdrop && !airdrop.escrow && denom && (
          <FormControl
            title="Airdrop fund method"
            subtitle="Please select which method you would like to use"
          >
            <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
              {FUND_RADIO_VALUES.map(({ id, title, subtitle }) => (
                <Radio
                  key={`fund-${id}`}
                  id={id}
                  htmlFor="fund-method"
                  title={title}
                  subtitle={subtitle}
                  onChange={() => setMethod(id)}
                  checked={method == id}
                />
              ))}
            </fieldset>
          </FormControl>
        )}
      </div>

      {airdrop && airdrop.escrow && (
        <div className="text-center">
          Please go to escrow step to complete your escrow deposit
        </div>
      )}

      {airdrop && !airdrop.escrow && (
        <div
          className={clsx('flex justify-end pb-6', {
            'sticky right-0 bottom-0': airdrop && !airdrop.escrow && denom,
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
              {
                'animate-pulse cursor-wait pointer-events-none': loading,
              }
            )}
            onClick={() => fund(method)}
          >
            {loading ? (
              <CgSpinnerAlt className="animate-spin" />
            ) : (
              <FaAsterisk />
            )}
            <span>Fund Airdrop</span>
          </button>
        </div>
      )}
    </section>
  )
}

export default withMetadata(FundAirdropPage, { center: false })
