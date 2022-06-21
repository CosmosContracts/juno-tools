import axios from 'axios'
import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { JsonPreview } from 'components/JsonPreview'
import { StackedList } from 'components/StackedList'
import { getConfig } from 'config'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { TokenInfoResponse } from 'contracts/cw20/base'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { BiCoinStack } from 'react-icons/bi'
import { FaAsterisk } from 'react-icons/fa'
import { NETWORK } from 'utils/constants'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { withMetadata } from 'utils/layout'

type ClaimState = 'loading' | 'not_claimed' | 'claimed' | 'no_allocation'

const ClaimAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const cw20MerkleAirdropContract = useContracts().cw20MerkleAirdrop
  const cw20BaseContract = useContracts().cw20Base

  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [proofs, setProofs] = useState<string[]>([''])
  const [name, setName] = useState('')
  const [cw20TokenAddress, setCW20TokenAddress] = useState('')
  const [balance, setBalance] = useState(Number(wallet.balance[0].amount))
  const [cw20TokenInfo, setCW20TokenInfo] = useState<TokenInfoResponse | null>({
    name: 'Juno Native Token',
    decimals: 6,
    symbol: getConfig(NETWORK).feeToken.slice(1).toUpperCase(),
    total_supply: '',
  })
  const [stage, setStage] = useState(0)

  const [airdropState, setAirdropState] = useState<ClaimState>('loading')

  const contractAddress = String(router.query.address)

  const transactionMessage =
    cw20MerkleAirdropContract?.messages()?.claim(contractAddress, stage, amount, proofs) || null

  useEffect(() => {
    const getAirdropInfo = async () => {
      try {
        if (!wallet.initialized || contractAddress === '') return

        const merkleAirdropContractMessages = cw20MerkleAirdropContract?.use(contractAddress)

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/proofs/contract/${contractAddress}/wallet/${wallet.address}`,
        )

        const { account, airdrop } = data
        if (account) {
          // eslint-disable-next-line @typescript-eslint/no-shadow
          const stage = await merkleAirdropContractMessages?.getLatestStage()
          const isClaimed = await merkleAirdropContractMessages?.isClaimed(wallet.address, stage || 0)

          setProofs(account.proofs)
          setAmount((account.amount as number).toString())
          setName(airdrop.name)
          setCW20TokenAddress(airdrop.cw20TokenAddress)

          if (isClaimed) setAirdropState('claimed')
          else setAirdropState('not_claimed')
        } else {
          setAirdropState('no_allocation')
        }
      } catch (err: any) {
        setLoading(false)
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      }
    }

    void getAirdropInfo()
  }, [contractAddress, wallet.address, wallet.initialized])

  useEffect(() => {
    if (!cw20BaseContract || !cw20TokenAddress) return

    const contractMessages = cw20BaseContract.use(cw20TokenAddress)

    contractMessages
      ?.balance(wallet.address)
      .then((data: string) => {
        setBalance(parseInt(data))
      })
      .catch(console.error)
  }, [cw20TokenAddress, wallet.address])

  useEffect(() => {
    if (!cw20BaseContract || !cw20TokenAddress) return

    const contractMessages = cw20BaseContract.use(cw20TokenAddress)

    contractMessages
      ?.tokenInfo()
      .then((data: TokenInfoResponse) => {
        setCW20TokenInfo(data)
      })
      .catch(console.error)
  }, [cw20TokenAddress])

  useEffect(() => {
    if (!cw20MerkleAirdropContract || contractAddress === '') return

    void cw20MerkleAirdropContract.use(contractAddress)?.getLatestStage().then(setStage)
  }, [cw20MerkleAirdropContract, contractAddress])

  const claim = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!cw20MerkleAirdropContract) return toast.error('Could not connect to smart contract')

      setLoading(true)

      const contractMessages = cw20MerkleAirdropContract.use(contractAddress)

      await contractMessages?.claim(wallet.address, stage, amount, proofs)

      setLoading(false)
      setAirdropState('claimed')
      toast.success('Successfully claimed the airdrop!', {
        style: { maxWidth: 'none' },
      })
      setBalance(balance + parseInt(amount))
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, {
        style: { maxWidth: 'none' },
      })
    }
  }

  const addToken = async () => {
    try {
      if (!window.getOfflineSigner) {
        throw new Error('Keplr extension is not available')
      }

      const config = getConfig(NETWORK)

      await window.keplr?.suggestToken(config.chainId, cw20TokenAddress)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, {
        style: { maxWidth: 'none' },
      })
    }
  }

  return (
    <section className="relative py-6 px-12 space-y-8">
      <NextSeo title="Claim Airdrop" />

      <div className="space-y-4">
        <h1 className="font-heading text-4xl font-bold">Claim Airdrop</h1>
        <Conditional test={!wallet.initialized}>
          <Alert type="warning">No wallet detected. Please connect your wallet before claiming an airdrop.</Alert>
        </Conditional>
        <Conditional test={wallet.initialized}>
          {airdropState === 'no_allocation' && (
            <Alert type="warning">
              <b>No allocation</b>
              You do not have any claimable tokens for this airdrop address.
            </Alert>
          )}
        </Conditional>
      </div>

      <Conditional test={wallet.initialized && (airdropState === 'not_claimed' || airdropState === 'claimed')}>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold">{name}</h3>
            <div className="flex-grow" />
            <img alt="juno" className="w-6 h-6 rounded-full" src="/juno_logo.png" />
            <span className="font-bold">
              {convertDenomToReadable(amount)} {cw20TokenInfo?.symbol}
            </span>
          </div>
          <StackedList>
            <StackedList.Item name="Airdrop Name">{name}</StackedList.Item>
            <StackedList.Item name="Airdrop Contract Address">{contractAddress}</StackedList.Item>
            <StackedList.Item name="Token Name">{cw20TokenInfo?.name}</StackedList.Item>
            <StackedList.Item name="Token Symbol">{cw20TokenInfo?.symbol}</StackedList.Item>
            <Conditional test={Boolean(cw20TokenAddress)}>
              <StackedList.Item name="Token Address">{cw20TokenAddress}</StackedList.Item>
            </Conditional>
            <StackedList.Item name="Claim Amount">
              {convertDenomToReadable(amount)} {cw20TokenInfo?.symbol}
            </StackedList.Item>
            <StackedList.Item name="Your Token Balance">
              {convertDenomToReadable(balance)} {cw20TokenInfo?.symbol}
            </StackedList.Item>
            <StackedList.Item name="Merkle Proofs">
              <pre className="overflow-auto p-2 text-sm bg-stone-800/80 rounded">{JSON.stringify(proofs, null, 2)}</pre>
            </StackedList.Item>
          </StackedList>
        </div>
      </Conditional>

      <Conditional test={wallet.initialized && airdropState !== 'no_allocation' && Boolean(transactionMessage)}>
        <JsonPreview content={transactionMessage} copyable isVisible={false} title="Show Transaction Message" />
      </Conditional>

      <Conditional test={wallet.initialized && airdropState !== 'no_allocation'}>
        <div className="flex justify-end pb-6 space-x-4">
          <Conditional test={Boolean(cw20TokenAddress)}>
            <Button isWide leftIcon={<BiCoinStack />} onClick={addToken}>
              Add Token to Keplr
            </Button>
          </Conditional>
          <Button
            className={clsx('px-8', {
              'bg-green-500': airdropState === 'claimed',
            })}
            isDisabled={airdropState !== 'not_claimed'}
            isLoading={loading}
            leftIcon={<FaAsterisk />}
            onClick={claim}
          >
            {airdropState === 'claimed' ? 'Airdrop Claimed' : 'Claim Airdrop'}
          </Button>
        </div>
      </Conditional>
    </section>
  )
}

export default withMetadata(ClaimAirdropPage, { center: false })
