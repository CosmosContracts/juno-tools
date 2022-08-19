import axios from 'axios'
import { AirdropsStepper } from 'components/AirdropsStepper'
import { AirdropStatus } from 'components/AirdropStatus'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { Input } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { Radio } from 'components/Radio'
import { Stats } from 'components/Stats'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import type { AirdropProps } from 'utils/constants'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { useDebounce } from 'utils/debounce'
import { getSignatureVerificationData } from 'utils/getSignatureVerificationData'
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
  const merkleAirdropContract = useContracts().cw20MerkleAirdrop

  const [loading, setLoading] = useState(false)
  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [amount, setAmount] = useState('0')
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string' ? router.query.contractAddress : '',
  )
  const [balance, setBalance] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [denom, setDenom] = useState<string | null>(null)
  const [decimals, setDecimals] = useState<number>(6)

  const [method, setMethod] = useState<FundMethod>('mint')

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const transactionMessage: any = airdrop?.isNative
    ? merkleAirdropContract?.messages()?.fundWithSend(airdrop.contractAddress, amount)
    : contract?.messages()?.mint(airdrop?.cw20TokenAddress || '', contractAddress, amount)

  useEffect(() => {
    if (contractAddress !== '') {
      setBalance(null)
      setTarget(null)
      setDenom(null)
      setAirdrop(null)
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}/balance`)
        .then(({ data }) => {
          const _balance = data.balance
          const _target = data.target
          const _denom = data.denom

          const needed = _target - _balance

          setBalance(_balance)
          setTarget(_target)
          setAmount(needed < 0 ? '0' : needed.toString())
          setDenom(_denom)
          setDecimals(data.decimals)
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
  }, [contractAddressDebounce])

  useEffect(() => {
    if (contractAddress !== '') {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`)
        .then(({ data }) => {
          setAirdrop(data.airdrop)
        })
        .catch((err: any) => {
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    } else setAirdrop(null)
  }, [contractAddressDebounce])

  useEffect(() => {
    if (router.query.contractAddress && typeof router.query.contractAddress === 'string')
      setContractAddress(router.query.contractAddress)
  }, [router.query])

  const fund = async (executeType: string) => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract || !merkleAirdropContract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing) return toast.error('Airdrop is being processed.\n Check back later!')

      const contractMessages = contract.use(airdrop.cw20TokenAddress)
      const merkleAirdropContractMessages = merkleAirdropContract.use(airdrop.contractAddress)

      if (!contractMessages || !merkleAirdropContractMessages || !transactionMessage)
        return toast.error('Could not connect to smart contract')

      setLoading(true)

      let result

      if (airdrop.isNative)
        result = await merkleAirdropContractMessages.fundWithSend(transactionMessage.amount[0].amount)
      else
        result = await contractMessages.mint(transactionMessage.msg.mint.recipient, transactionMessage.msg.mint.amount)

      setLoading(false)
      toast.success('Airdrop funded!', {
        style: { maxWidth: 'none' },
      })

      const verificationData = await getSignatureVerificationData(wallet, result.signed)

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`, {
        status: 'funded',
        verification: verificationData,
      })

      void router.push(`/airdrops/success`)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  const contractAddressOnChange = (value: string) => {
    setContractAddress(value)
    window.history.replaceState(null, '', `?contractAddress=${value}`)
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
        <FormControl
          htmlId="airdrop-cw20"
          subtitle="Address of the airdrop contract that will be funded."
          title="Airdrop contract address"
        >
          <Input
            id="airdrop-cw20"
            name="cw20"
            onChange={(e) => contractAddressOnChange(e.target.value)}
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            type="text"
            value={contractAddress}
          />
        </FormControl>

        <Conditional test={Boolean(airdrop?.processing) && airdrop?.escrow === false}>
          <div className="flex flex-col flex-grow justify-center items-center space-y-2 text-center">
            <CgSpinnerAlt className="animate-spin" size={64} />
            <h3 className="text-2xl font-bold">Processing Whitelist Data...</h3>
            <p className="text-white/50">Grab a cup of coffee, this may take a couple of minutes.</p>
          </div>
        </Conditional>

        {airdrop && <AirdropStatus airdrop={airdrop} contractAddress={contractAddress} page="fund" />}

        {airdrop && !airdrop.escrow && (
          <FormControl
            subtitle="View current airdrop amount, contract balance, and other information"
            title="Airdrop details"
          >
            <div className="grid grid-cols-3 gap-4 pb-2">
              <Stats title="Total amount">
                {balance ? (
                  <>
                    {convertDenomToReadable(target, decimals)} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Contract balance">
                {balance ? (
                  <>
                    {convertDenomToReadable(balance, decimals)} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Amount needed">
                {target && balance ? (
                  <>
                    {convertDenomToReadable(amount, decimals)} <Stats.Denom text={denom} />
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

        <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing && !airdrop.isNative && denom)}>
          <FormControl subtitle="Please select which method you would like to use" title="Airdrop fund method">
            <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
              {FUND_RADIO_VALUES.map(({ id, title, subtitle }) => (
                <Radio
                  key={`fund-${id}`}
                  checked={method === id}
                  htmlFor="fund-method"
                  id={id}
                  onChange={() => setMethod(id)}
                  subtitle={subtitle}
                  title={title}
                />
              ))}
            </fieldset>
          </FormControl>
        </Conditional>
      </div>

      {airdrop?.escrow && (
        <Alert type="warning">
          <span className="font-bold">Current airdrop is not eligible to fund.</span>
          <span>
            To continue airdrop funding,{' '}
            <Anchor
              className="font-bold text-plumbus hover:underline"
              href={`/airdrops/escrow/?contractAddress=${contractAddress}`}
            >
              click here to complete your escrow deposit at the airdrops escrow step
            </Anchor>
            .
          </span>
        </Alert>
      )}

      <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
        <JsonPreview content={transactionMessage} copyable isVisible={false} title="Show Transaction Message" />
      </Conditional>

      <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
        <div className="flex justify-end pb-6">
          <Button isLoading={loading} isWide leftIcon={<FaAsterisk />} onClick={() => void fund(method)}>
            Fund Airdrop
          </Button>
        </div>
      </Conditional>
    </section>
  )
}

export default withMetadata(FundAirdropPage, { center: false })
