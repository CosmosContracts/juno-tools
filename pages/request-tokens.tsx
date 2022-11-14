import axios from 'axios'
import clsx from 'clsx'
import { Button } from 'components/Button'
import { getConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'

import { TextInput } from '../components/forms/FormInput'

const RequestTokens: NextPage = () => {
  const router = useRouter()
  const wallet = useWallet()
  const client = wallet.getClient()

  const [loading, setLoading] = useState(false)

  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (router.query.address && typeof router.query.address === 'string') setWalletAddress(router.query.address)
    else setWalletAddress(wallet.address)
  }, [router.query, wallet.address])

  useEffect(() => {
    void getBalance().catch(console.error)
  }, [walletAddress])

  const getBalance = async () => {
    await client
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      ?.getBalance(walletAddress, 'ujunox')
      .then((res) => setBalance(res.amount))
      .catch(() => setBalance(''))
  }

  const requestTokens = async () => {
    try {
      const anyWindow: any = window

      if (!anyWindow.getOfflineSigner) {
        throw new Error('Keplr extension is not available')
      }

      const config = getConfig(NETWORK)
      console.log('config', config)
      setLoading(true)
      await axios
        .post('https://faucet.uni.juno.deuslabs.fi/credit', {
          denom: 'ujunox',
          address: walletAddress,
        })
        .then((res) => {
          console.log('res', res)
          toast.success('Tokens requested successfully')
          void getBalance()
        })
        .catch((err) => {
          console.log('err', err)
          toast.error(err.response.data)
          setLoading(false)
        })

      setLoading(false)
    } catch (err: any) {
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Token Faucet" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Token Faucet</h1>
      </div>

      <hr className="border-white/20" />

      <div className="grid grid-cols-2 w-3/4">
        <TextInput
          className="mr-2"
          defaultValue={wallet.address}
          id="recipient-address"
          name="recipient-address"
          onChange={(e) => {
            setWalletAddress(e.target.value)
          }}
          placeholder="Recipient Address"
          title="Recipient Address"
          value={walletAddress}
        />
        <TextInput
          className="w-[35%]"
          disabled
          id="current-balance"
          name="current-balance"
          title="Current Balance"
          value={`${Number(balance) / 1000000} junox`}
        />
      </div>
      <div className="flex w-full">
        <Button
          className={clsx(
            'flex items-center py-2 px-8 mr-5 space-x-2 font-bold bg-twitter rounded',
            'hover:bg-twitter transition hover:translate-y-[-1px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none': walletAddress === '',
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading },
          )}
          isLoading={loading}
          onClick={requestTokens}
          type="button"
        >
          <span>Request Tokens</span>
        </Button>
      </div>
    </div>
  )
}

export default withMetadata(RequestTokens, { center: false })
