import { fromBase64 } from '@cosmjs/encoding'
import { verifyADR36Amino } from '@keplr-wallet/cosmos'
import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { Input } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { TextArea } from 'components/TextArea'
import { getConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK, WEBSITE_URL } from 'utils/constants'
import { withMetadata } from 'utils/layout'

const SignAndVerify: NextPage = () => {
  const router = useRouter()
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
  const verifyDisabled = messageToVerify === '' || signerAddress === '' || signature === ''

  useEffect(() => {
    if (router.query.address && typeof router.query.address === 'string') setSignerAddress(router.query.address)
    if (router.query.message && typeof router.query.message === 'string') setMessageToVerify(router.query.message)
    if (router.query.signature && typeof router.query.signature === 'string') setSignature(router.query.signature)
  }, [router.query])

  const signMessage = async () => {
    try {
      const anyWindow: any = window

      if (!anyWindow.getOfflineSigner) {
        throw new Error('Keplr extension is not available')
      }

      const config = getConfig(NETWORK)

      setLoading(true)

      const signed = await window.keplr?.signArbitrary(config.chainId, wallet.address, messageToSign)

      setLoading(false)
      setSignedMessage(signed?.signature)
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
        fromBase64(signature),
      )

      if (data) toast.success(`Message is signed by given signer!`)
      else toast.error(`Message is not signed by given signer!`)

      setLoading(false)
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  const sendTweet = () => {
    try {
      const junoToolsQueryParams = new URLSearchParams({
        address: wallet.address,
        message: messageToSign,
        signature: signedMessage,
      })

      const twitterQueryParams = new URLSearchParams({
        text: `${messageToSign}

Verify tweet using:`,
        url: `${WEBSITE_URL}/sign-verify?${junoToolsQueryParams.toString()}`,
      }).toString()

      window.open(`https://twitter.com/intent/tweet?${twitterQueryParams}`, '_blank')?.focus()
    } catch (err: any) {
      toast.error(err.message)
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
      <FormControl htmlId="message" subtitle="Raw message data to be signed" title="Message">
        <TextArea
          className="h-[120px]"
          id="message"
          name="message"
          onChange={(e) => {
            setMessageToSign(e.target.value)
            setSignedMessage(null)
          }}
          placeholder="Hello world from my wallet!"
          value={messageToSign}
        />
      </FormControl>

      <div className="flex justify-end w-full">
        <Conditional test={signedMessage}>
          <button
            className={clsx(
              'flex items-center py-2 px-8 mr-5 space-x-2 font-bold bg-twitter rounded',
              'transition hover:translate-y-[-2px]',
              {
                'opacity-50 cursor-not-allowed pointer-events-none': signDisabled,
              },
              { 'animate-pulse cursor-wait pointer-events-none': loading },
            )}
            onClick={sendTweet}
            type="button"
          >
            <span>Send Tweet</span>
          </button>
        </Conditional>
        <button
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none': signDisabled,
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading },
          )}
          disabled={signDisabled}
          onClick={signMessage}
          type="button"
        >
          <span>Sign Message</span>
        </button>
      </div>

      {signedMessage && <JsonPreview content={signedMessage} copyable title="Signature" />}

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Verify Message</h1>
      </div>

      <hr className="border-white/20" />

      {/* signer address */}
      <FormControl htmlId="signer-address" subtitle="Address of the message signer" title="Signer Address">
        <Input
          id="signer-address"
          name="signer-address"
          onChange={(e) => setSignerAddress(e.target.value)}
          placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
          type="text"
          value={signerAddress}
        />
      </FormControl>

      {/* message */}
      <FormControl htmlId="message" subtitle="Raw message data to be verified" title="Message">
        <TextArea
          className="h-[120px]"
          id="message"
          name="message"
          onChange={(e) => setMessageToVerify(e.target.value)}
          placeholder="Hello world from my wallet!"
          value={messageToVerify}
        />
      </FormControl>

      {/* message */}
      <FormControl htmlId="signature" subtitle="Signature of the message" title="Signature">
        <Input
          id="signature"
          name="signature"
          onChange={(e) => setSignature(e.target.value.replaceAll('"', ''))}
          placeholder="dbNQOORuE80hUpoklFJITktXU6q/Dx07iC0KFI9rPEJGXk........."
          value={signature}
        />
      </FormControl>

      <div className="flex justify-end w-full">
        <button
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none': verifyDisabled,
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading },
          )}
          disabled={verifyDisabled}
          onClick={verifyMessage}
          type="button"
        >
          <span>Verify Message</span>
        </button>
      </div>
    </div>
  )
}

export default withMetadata(SignAndVerify, { center: false })
