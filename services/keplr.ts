import { useEffect, useState } from 'react'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Decimal } from '@cosmjs/math'
import { getConfig, keplrConfig, AppConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import toast from 'react-hot-toast'

export async function createClient(
  signer: OfflineSigner,
  network: string
): Promise<SigningCosmWasmClient> {
  const config = getConfig(network)

  return SigningCosmWasmClient.connectWithSigner(config.rpcUrl, signer, {
    gasPrice: {
      amount: Decimal.fromUserInput('0.0025', 100),
      denom: config.feeToken,
    },
  })
}

export async function loadKeplrWallet(
  config: AppConfig
): Promise<OfflineSigner> {
  const anyWindow: any = window
  if (!anyWindow.getOfflineSigner) {
    throw new Error('Keplr extension is not available')
  }

  await anyWindow.keplr.experimentalSuggestChain(keplrConfig(config))
  await anyWindow.keplr.enable(config.chainId)

  const signer = await anyWindow.getOfflineSignerAuto(config.chainId)
  signer.signAmino = signer.signAmino ?? signer.sign

  return Promise.resolve(signer)
}

export function useKeplr() {
  const { clear, init, initialized, network } = useWallet()
  const [initializing, setInitializing] = useState(false)
  const config = getConfig(network)

  const disconnect = () => {
    localStorage.clear()
    clear()
  }

  const connect = (walletChange = false) => {
    setInitializing(true)

    loadKeplrWallet(config)
      .then((signer) => {
        init(signer)
        if (walletChange) setInitializing(false)
      })
      .catch((err) => {
        setInitializing(false)
        toast.error(err.message)
      })
  }

  useEffect(() => {
    if (!initialized) return

    setInitializing(false)
  }, [initialized])

  return {
    connect,
    disconnect,
    initializing,
  }
}
