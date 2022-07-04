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
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import { useInterval } from 'hooks/useInterval'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import type { AirdropProps } from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import { getSignatureVerificationData } from 'utils/getSignatureVerificationData'
import { withMetadata } from 'utils/layout'

const RegisterAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const contract = useContracts().cw20MerkleAirdrop

  const [loading, setLoading] = useState(false)
  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string' ? router.query.contractAddress : '',
  )
  const [stage, setStage] = useState(0)

  // eslint-disable-next-line no-nested-ternary
  const start = airdrop?.start
    ? airdrop.startType === 'height'
      ? { at_height: airdrop.start }
      : { at_time: (airdrop.start * 1000000000).toString() }
    : null

  // eslint-disable-next-line no-nested-ternary
  const expiration = airdrop?.expiration
    ? airdrop.expirationType === 'height'
      ? { at_height: airdrop.expiration }
      : { at_time: (airdrop.expiration * 1000000000).toString() }
    : null

  const totalAmount = airdrop?.totalAmount ? airdrop.totalAmount : 0

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const transactionMessage = contract
    ?.messages()
    ?.registerAndReleaseEscrow(
      contractAddress,
      airdrop?.merkleRoot || '',
      start,
      expiration,
      totalAmount,
      stage,
      airdrop?.isTerraAirdrop ? 'terra' : undefined,
    )

  const showTransactionMessage = Boolean(airdrop && !airdrop.escrow && !airdrop.processing)

  useEffect(() => {
    if (router.query.contractAddress && typeof router.query.contractAddress === 'string')
      setContractAddress(router.query.contractAddress)
  }, [router.query])

  useEffect(() => {
    getAirdrop()
  }, [contractAddressDebounce])

  useInterval(() => {
    if (contractAddressDebounce !== '' && !airdrop?.escrow && airdrop?.processing) {
      getAirdrop()
    }
  }, 30000)

  useEffect(() => {
    if (!contract || contractAddress === '') return
    void contract.use(contractAddress)?.getLatestStage().then(setStage)
  }, [contract, contractAddress])

  const getAirdrop = () => {
    if (contractAddress !== '') {
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`)
        .then(({ data }) => {
          setAirdrop(data.airdrop)
        })
        .catch((err: any) => {
          setLoading(false)
          toast.error(err.message, {
            style: { maxWidth: 'none' },
          })
        })
    } else setAirdrop(null)
  }

  const register = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing) return toast.error('Airdrop is being processed.\n Check back later!')

      setLoading(true)

      const contractMessages = contract.use(contractAddress)

      if (!contractMessages || !transactionMessage) return toast.error('Could not connect to smart contract')

      // eslint-disable-next-line @typescript-eslint/no-shadow
      const stage = await contractMessages.getLatestStage()

      const result = await contractMessages.registerAndReleaseEscrow(
        transactionMessage[0].msg.register_merkle_root.merkle_root,
        transactionMessage[0].msg.register_merkle_root.start,
        transactionMessage[0].msg.register_merkle_root.expiration,
        airdrop.totalAmount,
        stage || 0,
        transactionMessage[0].msg.register_merkle_root.hrp,
      )

      setLoading(false)
      toast.success('Airdrop registered and escrow released', {
        style: { maxWidth: 'none' },
      })

      const verificationData = await getSignatureVerificationData(wallet, result.signed)

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`, {
        status: 'registered',
        verification: verificationData,
      })

      void router.push(`/airdrops/fund?contractAddress=${airdrop.contractAddress}`)
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
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Register Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Register Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={3} />
        </div>
        <p>Now that the contract is deployed, it can be registered to the JunoTools</p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <FormControl
          htmlId="airdrop-cw20"
          subtitle="Address of the airdrop contract that will be registered."
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

        {airdrop?.escrow && (
          <Alert type="warning">
            <span className="font-bold">Current airdrop is not eligible to register.</span>
            <span>
              To continue airdrop registration,{' '}
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

        <Conditional test={Boolean(airdrop?.processing) && airdrop?.escrow === false}>
          <div className="flex flex-col flex-grow justify-center items-center space-y-2 text-center">
            <CgSpinnerAlt className="animate-spin" size={64} />
            <h3 className="text-2xl font-bold">Processing Whitelist Data...</h3>
            <p className="text-white/50">Grab a cup of coffee, this may take a couple of minutes.</p>
          </div>
        </Conditional>

        {airdrop && !airdrop.escrow && (
          <AirdropStatus airdrop={airdrop} contractAddress={contractAddress} page="register" />
        )}

        <Conditional test={showTransactionMessage}>
          <JsonPreview content={transactionMessage} copyable isVisible={false} title="Show Transaction Message" />
        </Conditional>

        {airdrop && !airdrop.escrow && !airdrop.processing && (
          <div className="flex justify-end pb-6">
            <Button isLoading={loading} isWide onClick={register} rightIcon={<FaAsterisk />}>
              Register Airdrop
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default withMetadata(RegisterAirdropPage, { center: false })
