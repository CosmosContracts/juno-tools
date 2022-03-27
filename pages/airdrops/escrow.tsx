import axios from 'axios'
import clsx from 'clsx'
import AirdropsStepper from 'components/AirdropsStepper'
import AirdropStatus from 'components/AirdropStatus'
import Alert from 'components/Alert'
import Anchor from 'components/Anchor'
import Conditional from 'components/Conditional'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import useInterval from 'hooks/useInterval'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt, CgSpinnerTwoAlt } from 'react-icons/cg'
import { FaArrowRight, FaAsterisk } from 'react-icons/fa'
import { AirdropProps, ESCROW_AMOUNT } from 'utils/constants'
import useDebounce from 'utils/debounce'
import getSignatureVerificationData from 'utils/getSignatureVerificationData'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const EscrowAirdropPage: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const contract = useContracts().cw20MerkleAirdrop

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
    getAirdrop()
    // eslint-disable-next-line
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
  }

  const deposit = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return

      setLoading(true)

      const contractMessages = contract.use(contractAddress)
      if (!contractMessages)
        return toast.error('Could not connect to smart contract')

      const result = await contractMessages.depositEscrow()

      setLoading(false)
      toast.success('Deposit successful!')

      const verificationData = await getSignatureVerificationData(
        wallet,
        result.signed
      )

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        {
          escrowStatus: 'processing',
          // Sending signed data to backend for verification
          verification: verificationData,
        }
      )
      setAirdrop({ ...airdrop, escrowStatus: 'processing' })
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
          <p className="text-white/50">
            Grab a cup of coffee, this may take a couple of minutes.
          </p>
        </div>
      </Conditional>

      <Conditional test={airdrop?.escrowStatus !== 'processing'}>
        <Conditional test={contractAddress !== ''}>
          <Alert type="warning">
            Do not forget to save your airdrop contract address. If you lose it,
            you will not be able to continue with the rest of the creation
            process.
          </Alert>
        </Conditional>

        <Alert type="ghost">
          <p>
            To combat spam, we require a small deposit of{' '}
            <b>{ESCROW_AMOUNT} juno</b> before your airdrop can be created.
            <br />
            You will get this deposit returned to you when your airdrop is
            registered.
            <br />
            <br />
            You can read more about the escrow process on the{' '}
            <Anchor
              href={links['Docs Create Airdrop']}
              className="font-bold text-plumbus hover:underline"
            >
              documentation page
            </Anchor>
            .
          </p>
        </Alert>

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
            onChange={(e) => contractAddressOnChange(e.target.value)}
          />
        </FormControl>
      </Conditional>

      {airdrop && (
        <AirdropStatus
          airdrop={airdrop}
          contractAddress={contractAddress}
          page="escrow"
        />
      )}

      {airdrop && (
        <div className="flex justify-end pb-6">
          {!airdrop?.escrow && (
            <Anchor
              href={`/airdrops/register/?contractAddress=${contractAddress}`}
              className={clsx(
                'flex items-center py-2 px-8 space-x-2 font-bold',
                'bg-plumbus-50 hover:bg-plumbus-40 rounded',
                'transition hover:translate-y-[-2px]'
              )}
            >
              <span>Register Airdrop</span>
              <FaArrowRight />
            </Anchor>
          )}
          {airdrop.escrow && airdrop?.escrowStatus === 'waiting' && (
            <button
              disabled={loading}
              className={clsx(
                'flex items-center py-2 px-8 space-x-2 font-bold',
                'bg-plumbus-50 hover:bg-plumbus-40 rounded',
                'transition hover:translate-y-[-2px]',
                { 'animate-pulse cursor-wait': loading }
              )}
              onClick={deposit}
            >
              {loading ? (
                <CgSpinnerAlt className="animate-spin" />
              ) : (
                <FaAsterisk />
              )}
              <span>Deposit {ESCROW_AMOUNT} juno</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default withMetadata(EscrowAirdropPage, { center: false })
