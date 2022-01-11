import { useEffect, useState } from 'react'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { getConfig, keplrConfig, AppConfig } from 'config'
import { useWallet } from 'contexts/wallet'
import toast from 'react-hot-toast'

export async function createClient(
  signer: OfflineSigner,
  network: string
): Promise<SigningCosmWasmClient> {
  return SigningCosmWasmClient.connectWithSigner(
    getConfig(network).rpcUrl,
    signer
  )
}

export async function loadKeplrWallet(
  config: AppConfig
): Promise<OfflineSigner> {
  const anyWindow: any = window
  if (!anyWindow.getOfflineSigner) {
    throw new Error('Keplr extension is not available')
  }

  await anyWindow.keplr.enable(config.chainId)
  await anyWindow.keplr.experimentalSuggestChain(keplrConfig(config))

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

  const connect = () => {
    setInitializing(true)

    loadKeplrWallet(config)
      .then((signer) => {
        init(signer)
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
