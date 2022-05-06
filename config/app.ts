export interface MappedCoin {
  readonly denom: string
  readonly fractionalDigits: number
}

export type CoinMap = Readonly<Record<string, MappedCoin>>

export interface FeeOptions {
  upload: number
  exec: number
  init: number
}

export interface AppConfig {
  readonly chainId: string
  readonly chainName: string
  readonly addressPrefix: string
  readonly rpcUrl: string
  readonly httpUrl?: string
  readonly faucetUrl?: string
  readonly feeToken: string
  readonly stakingToken: string
  readonly coinMap: CoinMap
  readonly gasPrice: number
  readonly fees: FeeOptions
  readonly codeId?: number
}
