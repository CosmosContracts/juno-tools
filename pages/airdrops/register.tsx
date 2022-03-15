import axios from 'axios'
import clsx from 'clsx'
import AirdropsStepper from 'components/AirdropsStepper'
import AirdropStatus from 'components/AirdropStatus'
import Alert from 'components/Alert'
import Anchor from 'components/Anchor'
import Conditional from 'components/Conditional'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import useInterval from 'hooks/useInterval'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { AirdropProps } from 'utils/constants'
import useDebounce from 'utils/debounce'
import getSignatureVerificationData from 'utils/getSignatureVerificationData'
import { withMetadata } from 'utils/layout'

const RegisterAirdropPage: NextPage = () => {
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
  const start = airdrop?.start
    ? airdrop.startType === 'height'
      ? { at_height: airdrop.start }
      : { at_time: (airdrop.start * 1000000000).toString() }
    : null
  const expiration = airdrop?.expiration
    ? airdrop.expirationType === 'height'
      ? { at_height: airdrop.expiration }
      : { at_time: (airdrop.expiration * 1000000000).toString() }
    : null
  const [stage, setStage] = useState(0)

  const contractAddressDebounce = useDebounce(contractAddress, 500)

  const transactionMessage = contract
    ?.messages()
    ?.registerAndReleaseEscrow(
      contractAddress,
      airdrop?.merkleRoot || '',
      start,
      expiration,
      stage
    )

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

  useInterval(() => {
    if (
      contractAddressDebounce !== '' &&
      !airdrop?.escrow &&
      airdrop?.processing
    ) {
      getAirdrop()
    }
  }, 30000)

  useEffect(() => {
    if (!contract || contractAddress === '') return
    contract.use(contractAddress)?.getLatestStage().then(setStage)
  }, [contract, contractAddress])

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

  const register = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')
      if (!contract) return toast.error('Could not connect to smart contract')
      if (!airdrop) return
      if (airdrop.processing)
        return toast.error('Airdrop is being processed.\n Check back later!')

      setLoading(true)

      const contractMessages = contract.use(contractAddress)
      if (!contractMessages)
        return toast.error('Could not connect to smart contract')

      const stage = await contractMessages?.getLatestStage()

      const result = await contractMessages?.registerAndReleaseEscrow(
        airdrop.merkleRoot,
        start,
        expiration,
        airdrop.totalAmount,
        stage || 0
      )

      setLoading(false)
      toast.success('Airdrop registered and escrow released', {
        style: { maxWidth: 'none' },
      })

      const verificationData = await getSignatureVerificationData(
        wallet,
        result.signed
      )

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/airdrops/status/${contractAddress}`,
        {
          status: 'registered',
          verification: verificationData,
        }
      )

      router.push(`/airdrops/fund?contractAddress=${airdrop.contractAddress}`)
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
      <NextSeo title="Register Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Register Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={3} />
        </div>
        <p>
          Now that the contract is deployed, it can be registered to the
          JunoTools
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="space-y-8">
        <Conditional test={!airdrop?.processing}>
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

        {airdrop?.escrow && (
          <Alert type="warning">
            <span className="font-bold">
              Current airdrop is not eligible to register.
            </span>
            <span>
              To continue airdrop registration,{' '}
              <Anchor
                href={`/airdrops/escrow/?contractAddress=${contractAddress}`}
                className="font-bold text-plumbus hover:underline"
              >
                click here to complete your escrow deposit at the airdrops
                escrow step
              </Anchor>
              .
            </span>
          </Alert>
        )}

        <Conditional test={!!airdrop?.processing}>
          <div className="flex flex-col flex-grow justify-center items-center space-y-2 text-center">
            <CgSpinnerAlt className="animate-spin" size={64} />
            <h3 className="text-2xl font-bold">Processing Whitelist Data...</h3>
            <p className="text-white/50">
              Was that coffee good? Maybe it is time for some tea this time :)
            </p>
          </div>
        </Conditional>

        {airdrop && !airdrop.escrow && (
          <AirdropStatus
            airdrop={airdrop}
            contractAddress={contractAddress}
            page="register"
          />
        )}

        <Conditional
          test={!!(airdrop && !airdrop.escrow && !airdrop.processing)}
        >
          <JsonPreview
            title="Transaction Message"
            content={transactionMessage}
            copyable
          />
        </Conditional>

        {airdrop && !airdrop.escrow && !airdrop.processing && (
          <div className="flex justify-end pb-6">
            <button
              disabled={loading}
              className={clsx(
                'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
                'transition hover:translate-y-[-2px]',
                { 'animate-pulse cursor-wait pointer-events-none': loading }
              )}
              onClick={register}
            >
              {loading ? (
                <CgSpinnerAlt className="animate-spin" />
              ) : (
                <FaAsterisk />
              )}
              <span>Register Airdrop</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default withMetadata(RegisterAirdropPage, { center: false })
