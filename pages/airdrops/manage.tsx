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
import { Stats } from 'components/Stats'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import type { AirdropProps } from 'utils/constants'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { useDebounce } from 'utils/debounce'
import { withMetadata } from 'utils/layout'

const FUND_RADIO_VALUES = [
  {
    id: 'mint',
    title: `Mint`,
    subtitle: `Only the creator and the minter of the token can fund the airdrop directly from minting.\nAfter the airdrop is funded and the start time/block has passed, the airdrop will be claimable.`,
  },
] as const

type FundMethod = typeof FUND_RADIO_VALUES[number]['id']

const ManageAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const contract = useContracts().cw20Base
  const merkleAirdropContract = useContracts().cw20MerkleAirdrop
  const client = wallet.getClient()

  const [loading, setLoading] = useState(false)
  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [amount, setAmount] = useState('0')
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string' ? router.query.contractAddress : '',
  )
  const [balance, setBalance] = useState<number | null>(null)
  const [target, setTarget] = useState<number | null>(null)
  const [denom, setDenom] = useState<string | null>(null)
  const [recipientAddress, setRecipientAddress] = useState<string | null>(null)
  const [isExpired, setIsExpired] = useState<boolean>(false)
  const [currentBlockHeight, setCurrentBlockHeight] = useState<number | null>(null)

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const burnMessage: any = airdrop ? merkleAirdropContract?.messages()?.burn(airdrop.contractAddress, 1) : null
  const withdrawMessage: any = airdrop
    ? merkleAirdropContract
        ?.messages()
        ?.withdraw(airdrop.contractAddress, 1, recipientAddress ? recipientAddress : wallet.address)
    : null

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

  useEffect(() => {
    void getCurrentBlockHeight()
    isAirdropExpired()
  }, [contractAddressDebounce, airdrop?.expiration])

  const contractAddressOnChange = (value: string) => {
    setContractAddress(value)
    window.history.replaceState(null, '', `?contractAddress=${value}`)
  }

  const getCurrentBlockHeight = async () => {
    try {
      const blockInfo = await client.getBlock()
      setCurrentBlockHeight(blockInfo.header.height)
    } catch (err: any) {
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  const isAirdropExpired = () => {
    if (airdrop?.expirationType === null) setIsExpired(false)
    else if (airdrop?.expiration && airdrop.expirationType === 'timestamp')
      setIsExpired(airdrop.expiration * 1000 < Date.now())
    else if (airdrop?.expirationType === 'height' && currentBlockHeight)
      setIsExpired(airdrop.expiration ? airdrop.expiration < currentBlockHeight : false)
  }

  const burn = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract || !merkleAirdropContract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing) return toast.error('Airdrop is being processed.\n Check back later!')

      const contractMessages = contract.use(airdrop.cw20TokenAddress)
      const merkleAirdropContractMessages = merkleAirdropContract.use(airdrop.contractAddress)

      if (!contractMessages || !merkleAirdropContractMessages || !burnMessage)
        return toast.error('Could not connect to smart contract')

      setLoading(true)
      const _result = await merkleAirdropContractMessages.burn(burnMessage.msg.burn.stage)
      setLoading(false)
      toast.success('The remaining funds are burnt!', {
        style: { maxWidth: 'none' },
      })
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  const withdraw = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract || !merkleAirdropContract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing) return toast.error('Airdrop is being processed.\n Check back later!')

      const contractMessages = contract.use(airdrop.cw20TokenAddress)
      const merkleAirdropContractMessages = merkleAirdropContract.use(airdrop.contractAddress)

      if (!contractMessages || !merkleAirdropContractMessages || !withdrawMessage)
        return toast.error('Could not connect to smart contract')

      setLoading(true)
      const _result = await merkleAirdropContractMessages.withdraw(
        withdrawMessage.msg.withdraw.stage,
        withdrawMessage.msg.withdraw.address,
      )
      setLoading(false)
      toast.success('The remaining funds are withdrawn!', {
        style: { maxWidth: 'none' },
      })
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <section className="relative py-6 px-12 space-y-8">
      <NextSeo title="Manage Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Manage Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={5} />
        </div>
        <p>Manage the funds for your airdrop</p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <FormControl
          htmlId="airdrop-cw20"
          subtitle="Address of the airdrop contract to manage funds for."
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

        {airdrop && <AirdropStatus airdrop={airdrop} contractAddress={contractAddress} page="manage" />}

        {airdrop && !airdrop.escrow && (
          <FormControl
            subtitle="View current airdrop amount, contract balance, and other information"
            title="Airdrop details"
          >
            <div className="grid grid-cols-3 gap-4 pb-2">
              <Stats title="Total amount">
                {balance ? (
                  <>
                    {convertDenomToReadable(target)} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Contract balance">
                {balance ? (
                  <>
                    {convertDenomToReadable(balance)} <Stats.Denom text={denom} />
                  </>
                ) : (
                  '...'
                )}
              </Stats>
              <Stats title="Amount needed">
                {target && balance ? (
                  <>
                    {convertDenomToReadable(amount)} <Stats.Denom text={denom} />
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

        {airdrop && airdrop.expirationType === null && (
          <Alert type="warning">
            The airdrop does not have an expiration time and will stay active until all the funds are claimed. Remaining
            funds cannot be burnt or withdrawn.
          </Alert>
        )}

        {airdrop && !isExpired && airdrop.expirationType !== null && (
          <Alert type="warning">
            The airdrop is not yet expired. Remaining funds cannot be burnt or withdrawn before the airdrop expires.
          </Alert>
        )}

        {airdrop && !airdrop.escrow && (
          <div className="grid grid-cols-2 gap-8">
            <FormControl
              subtitle="Burn the remaining tokens. Once the tokens are burnt, they cannot be recovered!"
              title="Burn Remaining Tokens"
            >
              <fieldset className="relative p-4 space-y-4 rounded border-2 border-white/25">
                {/* <span className='pb-8'>Warning: </span> */}
                <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
                  <Button
                    className="mb-2 w-1/2"
                    isDisabled={!isExpired}
                    isLoading={loading}
                    isWide
                    leftIcon={<FaAsterisk />}
                    onClick={burn}
                  >
                    Burn Remaining Funds
                  </Button>
                </Conditional>
              </fieldset>
            </FormControl>

            <FormControl
              subtitle="Transfer the remaining tokens to a given address (current wallet address by default)."
              title="Withdraw Remaining Tokens"
            >
              <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
                <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
                  <Input
                    className="w-full"
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter recipient address"
                    type="string"
                    value={recipientAddress?.toString()}
                  />
                  <Button
                    isDisabled={!isExpired}
                    isLoading={loading}
                    isWide
                    leftIcon={<FaAsterisk />}
                    onClick={withdraw}
                  >
                    Withdraw Remaining Funds
                  </Button>
                </Conditional>
              </fieldset>
            </FormControl>
          </div>
        )}
        <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
          <JsonPreview content={burnMessage} copyable isVisible={false} title="Show Burn Message" />
        </Conditional>
        <Conditional test={Boolean(airdrop && !airdrop.escrow && !airdrop.processing)}>
          <JsonPreview content={withdrawMessage} copyable isVisible={false} title="Show Withdraw Message" />
        </Conditional>
      </div>
    </section>
  )
}

export default withMetadata(ManageAirdropPage, { center: false })
