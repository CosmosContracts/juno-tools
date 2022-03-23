import axios from 'axios'
import clsx from 'clsx'
import Alert from 'components/Alert'
import StackedList from 'components/StackedList'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

type ClaimState =
  | 'loading'
  | 'not_claimed'
  | 'claimed'
  | 'no_allocation'
  | 'not_allowed'

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

  const [airdropState, setAirdropState] = useState<ClaimState>('loading')

  const contractAddress = String(router.query.address)

  useEffect(() => {
    if (!wallet.initialized) return

    axios
      .get(
        `${process.env.NEXT_PUBLIC_API_URL}/proofs/contract/${contractAddress}/wallet/${wallet.address}`
      )
      .then(({ data }) => {
        const { account, airdrop } = data
        if (account) {
          setProofs(account.proofs)
          setAmount(account.amount.toString())
          setName(airdrop.name)
          setCW20TokenAddress(airdrop.cw20TokenAddress)
        } else {
          toast.error("You don't have any tokens to claim!")
          router.push('/airdrops')
        }
      })
      .catch((err: any) => {
        setLoading(false)
        toast.error(err.message, {
          style: { maxWidth: 'none' },
        })
      })
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
  }, [cw20BaseContract, cw20TokenAddress, wallet.address])

  const claim = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!cw20MerkleAirdropContract)
        return toast.error('Could not connect to smart contract')

      setLoading(true)

      const contractMessages = cw20MerkleAirdropContract.use(contractAddress)

      const stage = await contractMessages?.getLatestStage()

      await contractMessages?.claim(wallet.address, stage || 0, amount, proofs)

      setLoading(false)
      toast.success('Success!', {
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
        {!wallet.initialized && (
          <Alert type="warning">
            No wallet detected. Please connect your wallet before claiming an
            airdrop.
          </Alert>
        )}
        {wallet.initialized && (
          <p>
            Click the claim airdrop button below to add{' '}
            <b>{amount ?? '...'} juno</b> to your total balance.
            <br />
            Your current total token balance is <b>{balance / 1000000} juno</b>.
          </p>
        )}
      </div>

      {!wallet.initialized && (
        <div className="flex justify-center items-center p-8 space-x-4 text-xl text-center text-white/50">
          <CgSpinnerAlt className="animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {wallet.initialized && (
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-2xl font-bold">{name}</h3>
            <div className="flex-grow" />
            <img
              src="/juno_logo.png"
              alt="juno"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-bold">{amount} juno</span>
          </div>
          <StackedList>
            <StackedList.Item name="Airdrop Name">{name}</StackedList.Item>
            <StackedList.Item name="Claim Amount">
              {amount} juno
            </StackedList.Item>
            <StackedList.Item name="Merkle Proofs">
              <pre className="p-2 text-sm whitespace-pre bg-stone-800/80 rounded">
                {JSON.stringify(proofs, null, 2)}
              </pre>
            </StackedList.Item>
          </StackedList>
        </div>
      )}

      {wallet.initialized && (
        <div className="flex justify-end pb-6">
          <button
            className={clsx(
              'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
              'transition hover:translate-y-[-2px]',
              { 'animate-pulse cursor-wait pointer-events-none': loading }
            )}
            disabled={loading}
            onClick={claim}
          >
            {loading ? (
              <CgSpinnerAlt className="animate-spin" />
            ) : (
              <FaAsterisk />
            )}
            <span>Claim Airdrop</span>
          </button>
        </div>
      )}
    </section>
  )
}

export default withMetadata(ClaimAirdropPage, { center: false })
