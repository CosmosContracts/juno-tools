import { fromBase64 } from '@cosmjs/encoding'
import { verifyADR36Amino } from '@keplr-wallet/cosmos'
import clsx from 'clsx'
import Conditional from 'components/Conditional'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import JsonPreview from 'components/JsonPreview'
import TextArea from 'components/TextArea'
import { getConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'

const SignAndVerify: NextPage = () => {
  const wallet = useWallet()

  const [loading, setLoading] = useState(false)

  /* Signing */
  const [messageToSign, setMessageToSign] = useState('')
  const [signedMessage, setSignedMessage] = useState<any>(null)

  /* Verifying */
  const [signerAddress, setSignerAddress] = useState('')
  const [messageToVerify, setMessageToVerify] = useState('')
  const [signature, setSignature] = useState('')

  const signDisabled = messageToSign === ''
  const verifyDisabled =
    messageToVerify === '' || signerAddress === '' || signature === ''

  const signMessage = async () => {
    try {
      const anyWindow: any = window

      if (!anyWindow.getOfflineSigner) {
        throw new Error('Keplr extension is not available')
      }

      const config = getConfig(NETWORK)

      setLoading(true)

      const signed = await anyWindow.keplr.signArbitrary(
        config.chainId,
        wallet.address,
        messageToSign
      )

      setLoading(false)
      setSignedMessage(signed.signature)
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  const verifyMessage = async () => {
    try {
      setLoading(true)

      const client = wallet.getClient()

      const account = await client.getAccount(signerAddress)
      if (!account) throw new Error('Account not found')
      if (!account.pubkey) throw new Error('Account public key not found')

      const data = verifyADR36Amino(
        getConfig(NETWORK).addressPrefix,
        signerAddress,
        messageToVerify,
        fromBase64(account.pubkey.value),
        fromBase64(signature)
      )

      if (data) toast.success(`Message is signed by given signer!`)
      else toast.error(`Message is not signed by given signer!`)

      setLoading(false)
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Sign and Verify" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Sign Message</h1>
      </div>

      <hr className="border-white/20" />

      {/* message */}
      <FormControl
        title="Message"
        subtitle="Raw message data to be signed"
        htmlId="message"
      >
        <TextArea
          id="message"
          name="message"
          placeholder=""
          value={messageToSign}
          onChange={(e) => setMessageToSign(e.target.value)}
          className="h-[120px]"
        />
      </FormControl>

      <div className="flex justify-end w-full">
        <button
          disabled={signDisabled}
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none': signDisabled,
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading }
          )}
          onClick={signMessage}
        >
          <span>Sign Message</span>
        </button>
      </div>

      {signedMessage && (
        <JsonPreview copyable title="Signature" content={signedMessage} />
      )}

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Verify Message</h1>
      </div>

      <hr className="border-white/20" />

      {/* signer address */}
      <FormControl
        title="Signer Address"
        subtitle="Address of the message signer"
        htmlId="signer-address"
      >
        <Input
          id="signer-address"
          name="signer-address"
          type="text"
          placeholder=""
          value={signerAddress}
          onChange={(e) => setSignerAddress(e.target.value)}
        />
      </FormControl>

      {/* message */}
      <FormControl
        title="Message"
        subtitle="Raw message data to be verified"
        htmlId="message"
      >
        <TextArea
          id="message"
          name="message"
          placeholder=""
          value={messageToVerify}
          onChange={(e) => setMessageToVerify(e.target.value)}
          className="h-[120px]"
        />
      </FormControl>

      {/* message */}
      <FormControl
        title="Signature"
        subtitle="Signature of the message"
        htmlId="signature"
      >
        <Input
          id="signature"
          name="signature"
          placeholder=""
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
        />
      </FormControl>

      <div className="flex justify-end w-full">
        <button
          disabled={verifyDisabled}
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none':
                verifyDisabled,
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading }
          )}
          onClick={verifyMessage}
        >
          <span>Verify Message</span>
        </button>
      </div>
    </div>
  )
}

export default withMetadata(SignAndVerify, { center: false })
