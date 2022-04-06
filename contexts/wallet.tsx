import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { Decimal } from '@cosmjs/math'
import { OfflineSigner } from '@cosmjs/proto-signing'
import { Coin } from '@cosmjs/stargate'
import { AppConfig, getConfig, keplrConfig } from 'config'
import { FC, Fragment, VFC } from 'react'
import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { createTrackedSelector } from 'react-tracked'
import { NETWORK } from 'utils/constants'
import create, { State } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export interface KeplrWalletStore extends State {
  accountNumber: number
  address: string
  balance: Coin[]
  client: SigningCosmWasmClient | undefined
  config: AppConfig
  initialized: boolean
  initializing: boolean
  name: string
  network: string
  signer: OfflineSigner | undefined

  readonly clear: () => void
  readonly connect: (walletChange?: boolean | 'focus') => Promise<void>
  readonly disconnect: () => Promise<void>
  readonly getClient: () => SigningCosmWasmClient
  readonly getSigner: () => OfflineSigner
  readonly init: (signer?: OfflineSigner) => void
  readonly refreshBalance: (address?: string, balance?: Coin[]) => Promise<void>
  readonly setNetwork: (network: string) => void
  readonly updateSigner: (singer: OfflineSigner) => void
}

/** @deprecated replace with {@link KeplrWalletStore} */
export interface WalletContextType extends KeplrWalletStore {}

// ------------------------------------------------------------------------- //

const defaultStates = {
  accountNumber: 0,
  address: '',
  balance: [],
  client: undefined,
  config: getConfig(NETWORK),
  initialized: false,
  initializing: true,
  name: '',
  network: NETWORK,
  signer: undefined,
}

export const useWalletStore = create(
  subscribeWithSelector<KeplrWalletStore>((set, get) => ({
    ...defaultStates,
    clear: () => set({ ...defaultStates }),
    connect: async (walletChange = false) => {
      try {
        if (walletChange != 'focus') set({ initializing: true })
        const { config, init } = get()
        const signer = await loadKeplrWallet(config)
        init(signer)
        if (walletChange) set({ initializing: false })
      } catch (err: any) {
        toast.error(err?.message)
        set({ initializing: false })
      }
    },
    disconnect: async () => {
      window.localStorage.clear()
      get().clear()
      set({ initializing: false })
    },
    getClient: () => get().client!,
    getSigner: () => get().signer!,
    init: (signer) => set({ signer }),
    refreshBalance: async (
      address = get().address,
      balance = get().balance
    ) => {
      const { client, config } = get()
      if (!client) return
      balance.length = 0
      for (const denom in config.coinMap) {
        const coin = await client.getBalance(address, denom)
        if (coin) balance.push(coin)
      }
      set({ balance })
    },
    setNetwork: (network) => set({ network }),
    updateSigner: (signer) => set({ signer }),
  }))
)

export const useWallet = createTrackedSelector<KeplrWalletStore>(useWalletStore)

// ------------------------------------------------------------------------- //

export const WalletProvider: FC = ({ children }) => {
  return (
    <Fragment>
      {children}
      <WalletSubscription />
    </Fragment>
  )
}

const WalletSubscription: VFC = () => {
  useEffect(() => {
    const walletAddress = window.localStorage.getItem('wallet_address')
    if (walletAddress) {
      useWalletStore.getState().connect()
    } else {
      useWalletStore.setState({ initializing: false })
    }

    const listenChange = () => {
      useWalletStore.getState().connect(true)
    }
    const listenFocus = () => {
      if (walletAddress) useWalletStore.getState().connect('focus')
    }

    window.addEventListener('keplr_keystorechange', listenChange)
    window.addEventListener('focus', listenFocus)

    return () => {
      window.removeEventListener('keplr_keystorechange', listenChange)
      window.removeEventListener('focus', listenFocus)
    }
  }, [])

  useEffect(() => {
    return useWalletStore.subscribe(
      (x) => x.signer,
      async (signer) => {
        if (!signer) return
        try {
          useWalletStore.setState({
            client: await createClient({ signer }),
          })
        } catch (error) {
          console.log(error)
        }
      }
    )
  }, [])

  useEffect(() => {
    return useWalletStore.subscribe(
      (x) => x.client,
      async (client) => {
        const { config, refreshBalance, signer } = useWalletStore.getState()
        if (!signer || !client) return
        if (!window.keplr) {
          throw new Error('window.keplr not found')
        }
        const balance: Coin[] = []
        const address = (await signer.getAccounts())[0].address
        const account = await client.getAccount(address)
        const key = await window.keplr.getKey(config.chainId)
        await refreshBalance(address, balance)
        window.localStorage.setItem('wallet_address', address)
        useWalletStore.setState({
          accountNumber: account?.accountNumber || 0,
          address,
          balance,
          initialized: true,
          initializing: false,
          name: key.name || '',
        })
      }
    )
  }, [])

  return null
}

// ------------------------------------------------------------------------- //

const createClient = ({ signer }: { signer: OfflineSigner }) => {
  const { config } = useWalletStore.getState()
  return SigningCosmWasmClient.connectWithSigner(config.rpcUrl, signer, {
    gasPrice: {
      amount: Decimal.fromUserInput('0.0025', 100),
      denom: config.feeToken,
    },
  })
}

const loadKeplrWallet = async (config: AppConfig) => {
  if (
    !window.getOfflineSigner ||
    !window.keplr ||
    !window.getOfflineSignerAuto
  ) {
    throw new Error('Keplr extension is not available')
  }

  await window.keplr.experimentalSuggestChain(keplrConfig(config))
  await window.keplr.enable(config.chainId)

  const signer = await window.getOfflineSignerAuto(config.chainId)
  Object.assign(signer, {
    signAmino: (signer as any).signAmino ?? (signer as any).sign,
  })

  return signer
}
