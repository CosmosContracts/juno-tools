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

/**
 * Keplr wallet store type definitions, merged from previous kepler ctx and
 * previous wallet ctx.
 *
 * - previous keplr ctx: https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts
 * - previous wallet ctx: https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx
 */
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

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L69-L72 */
  readonly clear: () => void

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L50-L62 */
  readonly connect: (walletChange?: boolean | 'focus') => Promise<void>

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L45-L48 */
  readonly disconnect: () => Promise<void>

  readonly getClient: () => SigningCosmWasmClient
  readonly getSigner: () => OfflineSigner

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L63 */
  readonly init: (signer?: OfflineSigner) => void

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L75-L89 */
  readonly refreshBalance: (address?: string, balance?: Coin[]) => Promise<void>

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L65 */
  readonly setNetwork: (network: string) => void

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L91-L93 */
  readonly updateSigner: (singer: OfflineSigner) => void
}

/**
 * Compatibility export for references still using `WalletContextType`
 *
 * @deprecated replace with {@link KeplrWalletStore}
 */
export interface WalletContextType extends KeplrWalletStore {}

/**
 * Keplr wallet store default values as a separate variable for reusability
 */
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

/**
 * Entrypoint for keplr wallet store using {@link defaultStates}
 */
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

/**
 * Proxied keplr wallet store which only rerenders on called state values.
 *
 * Recommended if only consuming state; to set states, use {@link useWalletStore.setState}.
 *
 * @example
 *
 * ```ts
 * // this will rerender if any state values has changed
 * const { name } = useWalletStore()
 *
 * // this will rerender if only `name` has changed
 * const { name } = useWallet()
 * ```
 */
export const useWallet = createTrackedSelector<KeplrWalletStore>(useWalletStore)

/**
 * Keplr wallet store provider to easily mount {@link WalletSubscription}
 * to listen/subscribe various state changes.
 *
 */
export const WalletProvider: FC = ({ children }) => {
  return (
    <Fragment>
      {children}
      <WalletSubscription />
    </Fragment>
  )
}

/**
 * Keplr wallet subscriptions (side effects)
 */
const WalletSubscription: VFC = () => {
  /**
   * Dispatch reconnecting wallet on first mount and register events to refresh
   * on keystore change and window refocus.
   *
   * @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/pages/_app.tsx#L19-L35
   */
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

  /**
   * Watch signer changes to initialize client state.
   *
   * @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L95-L105
   */
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

  /**
   * Watch client changes to refresh balance and sync wallet states.
   *
   * @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L107-L139
   */
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

/**
 * Function to create signing client based on {@link useWalletStore} resolved
 * config state.
 *
 * @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L9-L21
 * @param arg Object argument requiring `signer`
 */
const createClient = ({ signer }: { signer: OfflineSigner }) => {
  const { config } = useWalletStore.getState()
  return SigningCosmWasmClient.connectWithSigner(config.rpcUrl, signer, {
    gasPrice: {
      amount: Decimal.fromUserInput('0.0025', 100),
      denom: config.feeToken,
    },
  })
}

/**
 * Function to load keplr wallet signer.
 *
 * @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L23-L38
 * @param config Application configuration
 */
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
