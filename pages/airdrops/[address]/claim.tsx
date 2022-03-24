import axios from 'axios'
import clsx from 'clsx'
import Alert from 'components/Alert'
import Conditional from 'components/Conditional'
import JsonPreview from 'components/JsonPreview'
import StackedList from 'components/StackedList'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { TokenInfoResponse } from 'contracts/cw20/base'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
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
  const [balance, setBalance] = useState(0)
  const [cw20TokenInfo, setCW20TokenInfo] = useState<TokenInfoResponse | null>(
    null
  )
  const [airdropState, setAirdropState] = useState<ClaimState>('loading')
  const [stage, setStage] = useState(0)

  const contractAddress = String(router.query.address)

  const transactionMessage =
    cw20MerkleAirdropContract
      ?.messages()
      ?.claim(contractAddress, stage, amount, proofs) || null

  useEffect(() => {
    const getAirdropInfo = async () => {
      try {
        if (!wallet.initialized || contractAddress === '') return

        const merkleAirdropContractMessages =
          cw20MerkleAirdropContract?.use(contractAddress)

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/proofs/contract/${contractAddress}/wallet/${wallet.address}`
        )

        const { account, airdrop } = data
        if (account) {
          const stage = await merkleAirdropContractMessages?.getLatestStage()
          const isClaimed = await merkleAirdropContractMessages?.isClaimed(
            wallet.address,
            stage || 0
          )

          setProofs(account.proofs)
          setAmount(account.amount.toString())
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

    getAirdropInfo()
  }, [contractAddress, wallet.address, wallet.initialized])

  useEffect(() => {
    if (!cw20BaseContract || !cw20TokenAddress) return

    const contractMessages = cw20BaseContract.use(cw20TokenAddress)

    contractMessages
      ?.balance(wallet.address)
      .then((data: string) => {
        setBalance(parseInt(data))
      })
      .catch((err) => {})
  }, [cw20TokenAddress, wallet.address])

  useEffect(() => {
    if (!cw20BaseContract || !cw20TokenAddress) return

    const contractMessages = cw20BaseContract.use(cw20TokenAddress)

    contractMessages
      ?.tokenInfo()
      .then((data: TokenInfoResponse) => {
        setCW20TokenInfo(data)
      })
      .catch((err) => {})
  }, [cw20TokenAddress])

  useEffect(() => {
    if (!cw20MerkleAirdropContract || contractAddress === '') return

    cw20MerkleAirdropContract
      .use(contractAddress)
      ?.getLatestStage()
      .then(setStage)
  }, [contractAddress])

  const claim = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!cw20MerkleAirdropContract)
        return toast.error('Could not connect to smart contract')

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

  return (
    <section className="relative py-6 px-12 space-y-8">
      <NextSeo title="Claim Airdrop" />

      <div className="space-y-4">
        <h1 className="font-heading text-4xl font-bold">Claim Airdrop</h1>
        <Conditional test={!wallet.initialized}>
          <Alert type="warning">
            No wallet detected. Please connect your wallet before claiming an
            airdrop.
          </Alert>
        </Conditional>
        <Conditional test={wallet.initialized}>
          {airdropState == 'no_allocation' && (
            <Alert type="warning">
              <b>No allocation</b>
              You do not have any claimable tokens for this airdrop address.
            </Alert>
          )}
        </Conditional>
      </div>

      <Conditional
        test={
          wallet.initialized &&
          (airdropState === 'not_claimed' || airdropState == 'claimed')
        }
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold">{name}</h3>
            <div className="flex-grow" />
            <img
              src="/juno_logo.png"
              alt="juno"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-bold">{parseInt(amount) / 1000000} juno</span>
          </div>
          <StackedList>
            <StackedList.Item name="Airdrop Name">{name}</StackedList.Item>
            <StackedList.Item name="Airdrop Contract Address">
              {contractAddress}
            </StackedList.Item>
            <StackedList.Item name="Token Name">
              {cw20TokenInfo?.name}
            </StackedList.Item>
            <StackedList.Item name="Token Symbol">
              {cw20TokenInfo?.symbol}
            </StackedList.Item>
            <StackedList.Item name="Token Address">
              {cw20TokenAddress}
            </StackedList.Item>
            <StackedList.Item name="Claim Amount">
              {parseInt(amount) / 1000000} juno
            </StackedList.Item>
            <StackedList.Item name="Your Token Balance">
              {balance / 1000000} juno
            </StackedList.Item>
            <StackedList.Item name="Merkle Proofs">
              <pre className="overflow-auto p-2 text-sm bg-stone-800/80 rounded">
                {JSON.stringify(proofs, null, 2)}
              </pre>
            </StackedList.Item>
          </StackedList>
        </div>
      </Conditional>

      <Conditional
        test={
          wallet.initialized &&
          airdropState !== 'no_allocation' &&
          !!transactionMessage
        }
      >
        <JsonPreview
          title="Show Transaction Message"
          content={transactionMessage}
          copyable
          isVisible={false}
        />
      </Conditional>

      <Conditional
        test={wallet.initialized && airdropState !== 'no_allocation'}
      >
        <div className="flex justify-end pb-6">
          <button
            className={clsx(
              'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
              'transition hover:translate-y-[-2px]',
              {
                'animate-pulse cursor-wait pointer-events-none': loading,
                'opacity-50 pointer-events-none': airdropState != 'not_claimed',
                'bg-green-500': airdropState == 'claimed',
              }
            )}
            disabled={loading || airdropState != 'not_claimed'}
            onClick={claim}
          >
            {loading ? (
              <CgSpinnerAlt className="animate-spin" />
            ) : (
              <FaAsterisk />
            )}
            <span>
              {airdropState == 'claimed' ? 'Airdrop Claimed' : 'Claim Airdrop'}
            </span>
          </button>
        </div>
      </Conditional>
    </section>
  )
}

export default withMetadata(ClaimAirdropPage, { center: false })
