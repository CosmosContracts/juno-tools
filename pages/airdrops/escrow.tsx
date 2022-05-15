import axios from 'axios'
import { AirdropsStepper } from 'components/AirdropsStepper'
import { AirdropStatus } from 'components/AirdropStatus'
import { Alert } from 'components/Alert'
import { Anchor } from 'components/Anchor'
import { AnchorButton } from 'components/AnchorButton'
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
import { CgSpinnerTwoAlt } from 'react-icons/cg'
import { FaArrowRight, FaAsterisk } from 'react-icons/fa'
import type { AirdropProps } from 'utils/constants'
import { ESCROW_AMOUNT } from 'utils/constants'
import { useDebounce } from 'utils/debounce'
import { getSignatureVerificationData } from 'utils/getSignatureVerificationData'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const EscrowAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const contract = useContracts().cw20MerkleAirdrop

  const [loading, setLoading] = useState(false)
  const [airdrop, setAirdrop] = useState<AirdropProps | null>(null)
  const [contractAddress, setContractAddress] = useState(
    typeof router.query.contractAddress === 'string' ? router.query.contractAddress : '',
  )

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const transactionMessage = contract?.messages()?.depositEscrow(contractAddress)

  useEffect(() => {
    if (router.query.contractAddress && typeof router.query.contractAddress === 'string')
      setContractAddress(router.query.contractAddress)
  }, [router.query])

  useEffect(() => {
    getAirdrop()
  }, [contractAddressDebounce])

  // Query server for airdrop every 30 seconds
  useInterval(() => {
    if (contractAddressDebounce !== '' && airdrop?.escrow) {
      getAirdrop()
    }
  }, 30000)

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

  const deposit = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return

      setLoading(true)

      const contractMessages = contract.use(contractAddress)
      if (!contractMessages) return toast.error('Could not connect to smart contract')

      const result = await contractMessages.depositEscrow()

      setLoading(false)
      toast.success('Deposit successful!')

      const verificationData = await getSignatureVerificationData(wallet, result.signed)

      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`, {
        escrowStatus: 'processing',
        // Sending signed data to backend for verification
        verification: verificationData,
      })
      setAirdrop({ ...airdrop, escrowStatus: 'processing' })
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
      <NextSeo title="Escrow Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Escrow Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={2} />
        </div>
        <p>Complete the escrow step before registering your airdrop</p>
      </div>

      <hr className="border-white/20" />

      <Conditional test={airdrop?.escrowStatus === 'processing'}>
        <div className="flex flex-col flex-grow justify-center items-center space-y-2 text-center">
          <CgSpinnerTwoAlt className="animate-spin" size={64} />
          <h3 className="text-2xl font-bold">Processing Escrow...</h3>
          <p className="text-white/50">Grab a cup of coffee, this may take a couple of minutes.</p>
        </div>
      </Conditional>

      <Conditional test={airdrop?.escrowStatus !== 'processing'}>
        <Conditional test={contractAddress !== ''}>
          <Alert type="warning">
            Do not forget to save your airdrop contract address. If you lose it, you will not be able to continue with
            the rest of the creation process.
          </Alert>
        </Conditional>

        <Alert type="ghost">
          <p>
            To combat spam, we require a small deposit of <b>{ESCROW_AMOUNT} juno</b> before your airdrop can be
            created.
            <br />
            You will get this deposit returned to you when your airdrop is registered.
            <br />
            <br />
            You can read more about the escrow process on the{' '}
            <Anchor className="font-bold text-plumbus hover:underline" href={links['Docs Create Airdrop']}>
              documentation page
            </Anchor>
            .
          </p>
        </Alert>

        <FormControl htmlId="airdrop-cw20" subtitle="Address of the airdrop contract" title="Airdrop contract address">
          <Input
            id="airdrop-cw20"
            name="cw20"
            onChange={(e) => contractAddressOnChange(e.target.value)}
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            type="text"
            value={contractAddress}
          />
        </FormControl>
      </Conditional>

      {airdrop && <AirdropStatus airdrop={airdrop} contractAddress={contractAddress} page="escrow" />}

      <Conditional test={Boolean(airdrop?.escrow && airdrop.escrowStatus === 'waiting')}>
        <JsonPreview content={transactionMessage} copyable isVisible={false} title="Show Transaction Message" />
      </Conditional>

      {airdrop && (
        <div className="flex justify-end pb-6">
          {!airdrop.escrow && (
            <AnchorButton
              href={`/airdrops/register/?contractAddress=${contractAddress}`}
              isWide
              leftIcon={<FaArrowRight />}
            >
              Register Airdrop
            </AnchorButton>
          )}
          {airdrop.escrow && airdrop.escrowStatus === 'waiting' && (
            <Button isLoading={loading} isWide leftIcon={<FaAsterisk />} onClick={deposit}>
              Deposit {ESCROW_AMOUNT} juno
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default withMetadata(EscrowAirdropPage, { center: false })
