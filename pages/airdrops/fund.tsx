import axios from 'axios'
import AirdropsStepper from 'components/AirdropsStepper'
import AirdropStatus from 'components/AirdropStatus'
import Alert from 'components/Alert'
import Anchor from 'components/Anchor'
import Button from 'components/Button'
import Conditional from 'components/Conditional'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import Radio from 'components/Radio'
import Stats from 'components/Stats'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { AirdropProps } from 'utils/constants'
import convertDenomToReadable from 'utils/convertDenomToReadable'
import useDebounce from 'utils/debounce'
import getSignatureVerificationData from 'utils/getSignatureVerificationData'
import { withMetadata } from 'utils/layout'

const FUND_RADIO_VALUES = [
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
  const [denom, setDenom] = useState<string | null>(null)

  const [method, setMethod] = useState<FundMethod>('mint')

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const transactionMessage = contract
    ?.messages()
    ?.mint(airdrop?.cw20TokenAddress || '', contractAddress, amount)

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
  }, [contractAddressDebounce])

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
  }, [contractAddressDebounce])

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

      const contractMessages = contract.use(airdrop.cw20TokenAddress)

      if (!contractMessages || !transactionMessage)
        return toast.error('Could not connect to smart contract')

      setLoading(true)

      const result = await contractMessages.mint(
        transactionMessage.msg.mint.recipient,
        transactionMessage.msg.mint.amount
      )

      setLoading(false)
      toast.success('Airdrop funded!', {
        style: { maxWidth: 'none' },
      })

      const verificationData = await getSignatureVerificationData(
        wallet,
        result.signed
      )

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        {
          status: 'funded',
          verification: verificationData,
        }
      )

      router.push(`/airdrops/success`)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  const contractAddressOnChange = (value: string) => {
    setContractAddress(value)
    window.history.replaceState(null, '', '?contractAddress=' + value)
  }

  return (
    <section className="relative py-6 px-12 space-y-8">
      <NextSeo title="Fund Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Fund Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={4} />
        </div>
        <p>Fund your registered airdrop</p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <Conditional test={!airdrop?.processing}>
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
              onChange={(e) => contractAddressOnChange(e.target.value)}
            />
          </FormControl>
        </Conditional>

        <Conditional test={!!airdrop?.processing}>
          <div className="flex flex-col flex-grow justify-center items-center space-y-2 text-center">
            <CgSpinnerAlt className="animate-spin" size={64} />
            <h3 className="text-2xl font-bold">Processing Whitelist Data...</h3>
            <p className="text-white/50">
              Was that coffee good? Maybe it is time for some tea this time :)
            </p>
          </div>
        </Conditional>

        {airdrop && (
          <AirdropStatus
            airdrop={airdrop}
            contractAddress={contractAddress}
            page="fund"
          />
        )}

        {airdrop && !airdrop.escrow && (
          <FormControl
            title="Airdrop details"
            subtitle="View current airdrop amount, contract balance, and other information"
          >
            <div className="grid grid-cols-3 gap-4 pb-2">
              <Stats title="Total amount">
                {balance ? (
                  <>
                    {convertDenomToReadable(target)}{' '}
                    <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Contract balance">
                {balance ? (
                  <>
                    {convertDenomToReadable(balance)}{' '}
                    <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Amount needed">
                {target && balance ? (
                  <>
                    {convertDenomToReadable(amount)}{' '}
                    <Stats.Denom text={denom} />
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

        <Conditional
          test={!!(airdrop && !airdrop.escrow && !airdrop.processing && denom)}
        >
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
        </Conditional>
      </div>

      {airdrop?.escrow && (
        <Alert type="warning">
          <span className="font-bold">
            Current airdrop is not eligible to fund.
          </span>
          <span>
            To continue airdrop funding,{' '}
            <Anchor
              href={`/airdrops/escrow/?contractAddress=${contractAddress}`}
              className="font-bold text-plumbus hover:underline"
            >
              click here to complete your escrow deposit at the airdrops escrow
              step
            </Anchor>
            .
          </span>
        </Alert>
      )}

      <Conditional test={!!(airdrop && !airdrop.escrow && !airdrop.processing)}>
        <JsonPreview
          title="Show Transaction Message"
          content={transactionMessage}
          copyable
          isVisible={false}
        />
      </Conditional>

      <Conditional test={!!(airdrop && !airdrop.escrow && !airdrop.processing)}>
        <div className="flex justify-end pb-6">
          <Button
            isLoading={loading}
            isWide
            leftIcon={<FaAsterisk />}
            onClick={() => fund(method)}
          >
            Fund Airdrop
          </Button>
        </div>
      </Conditional>
    </section>
  )
}

export default withMetadata(FundAirdropPage, { center: false })
