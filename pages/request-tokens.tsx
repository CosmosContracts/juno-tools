/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable @typescript-eslint/no-shadow */
import type { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { useWallet } from '@cosmos-kit/react'
import axios from 'axios'
import clsx from 'clsx'
import { Button } from 'components/Button'
import { useInputState } from 'components/forms/FormInput.hooks'
import { getConfig } from 'config'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'
import { withMetadata } from 'utils/layout'

import { TextInput } from '../components/forms/FormInput'

const RequestTokens: NextPage = () => {
  const [client, setClient] = useState<CosmWasmClient>()
  const wallet = useWallet()

  useEffect(() => {
    const getClient = async () => {
      await wallet
        .getCosmWasmClient()
        .then((client) => {
          setClient(client)
          console.log(client)
        })
        .catch((err) => {
          console.log(err)
        })
    }
    void getClient()
    if (wallet.isWalletConnected) setWalletAddress(wallet.address as string)
    else {
      setWalletAddress('')
      recipientAddressState.onChange('')
    }
  }, [wallet.isWalletConnected])

  const [loading, setLoading] = useState(false)

  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState('')

  useEffect(() => {
    if (wallet.isWalletConnected) {
      setWalletAddress(wallet.address as string)
      void getBalance(walletAddress).catch(console.error)
    } else {
      setWalletAddress('')
      recipientAddressState.onChange('')
      setBalance('')
    }
  }, [wallet.address, wallet.isWalletConnected, client])

  useEffect(() => {
    if (walletAddress) void getBalance(walletAddress).catch(console.error)
    else setBalance('')
  }, [client, walletAddress])

  const getBalance = async (address: string) => {
    console.log('getBalance')
    await client
      ?.getBalance(address, 'ujunox')
      .then((res) => {
        console.log('Balance', res)
        setBalance(res.amount)
      })
      .catch(() => {
        setBalance('')
      })
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
          void getBalance(walletAddress).catch(console.error)
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

  const recipientAddressState = useInputState({
    id: 'recipient',
    name: 'recipient',
    title: 'Recipient Address',
    placeholder: 'Recipient Address',
    defaultValue: walletAddress,
  })

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Token Faucet" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Token Faucet</h1>
      </div>

      <hr className="border-white/20" />

      <div className="grid grid-cols-2 w-3/4">
        <TextInput
          {...recipientAddressState}
          className="mr-2"
          onChange={(e) => {
            recipientAddressState.onChange(e.target.value)
            setWalletAddress(e.target.value)
          }}
        />
        {client && (
          <TextInput
            className="w-[35%]"
            disabled
            id="current-balance"
            name="current-balance"
            title="Current Balance"
            value={`${Number(balance) / 1000000} junox`}
          />
        )}
      </div>
      <div className="flex w-full">
        <Button
          className={clsx(
            'flex items-center py-2 px-8 mr-5 space-x-2 font-bold bg-twitter rounded',
            'hover:bg-twitter transition hover:translate-y-[-1px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none': !recipientAddressState.value,
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
