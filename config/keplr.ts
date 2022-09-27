import type { ChainInfo } from '@keplr-wallet/types'

import type { AppConfig } from './app'

export interface KeplrCoin {
  readonly coinDenom: string
  readonly coinMinimalDenom: string
  readonly coinDecimals: number
}

export interface KeplrConfig {
  readonly chainId: string
  readonly chainName: string
  readonly rpc: string
  readonly rest?: string
  readonly bech32Config: {
    readonly bech32PrefixAccAddr: string
    readonly bech32PrefixAccPub: string
    readonly bech32PrefixValAddr: string
    readonly bech32PrefixValPub: string
    readonly bech32PrefixConsAddr: string
    readonly bech32PrefixConsPub: string
  }
  readonly currencies: readonly KeplrCoin[]
  readonly feeCurrencies: readonly KeplrCoin[]
  readonly stakeCurrency: KeplrCoin
  readonly gasPriceStep: {
    readonly low: number
    readonly average: number
    readonly high: number
  }
  readonly bip44: { readonly coinType: number }
  readonly coinType: number
}

export const keplrConfig = (config: AppConfig): ChainInfo => ({
  chainId: config.chainId,
  chainName: config.chainName,
  rpc: config.rpcUrl,
  rest: config.httpUrl!,
  bech32Config: {
    bech32PrefixAccAddr: `${config.addressPrefix}`,
    bech32PrefixAccPub: `${config.addressPrefix}pub`,
    bech32PrefixValAddr: `${config.addressPrefix}valoper`,
    bech32PrefixValPub: `${config.addressPrefix}valoperpub`,
    bech32PrefixConsAddr: `${config.addressPrefix}valcons`,
    bech32PrefixConsPub: `${config.addressPrefix}valconspub`,
  },
  currencies: [
    {
      coinDenom: config.coinMap[config.feeToken].denom,
      coinMinimalDenom: config.feeToken,
      coinDecimals: config.coinMap[config.feeToken].fractionalDigits,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: config.coinMap[config.feeToken].denom,
      coinMinimalDenom: config.feeToken,
      coinDecimals: config.coinMap[config.feeToken].fractionalDigits,
    },
  ],
  stakeCurrency: {
    coinDenom: config.coinMap[config.stakingToken].denom,
    coinMinimalDenom: config.stakingToken,
    coinDecimals: config.coinMap[config.stakingToken].fractionalDigits,
  },
  gasPriceStep: {
    low: config.gasPrice / 2,
    average: config.gasPrice,
    high: config.gasPrice * 2,
  },
  bip44: { coinType: 118 },
  coinType: 118,
  features: ['ibc-transfer', 'cosmwasm', 'ibc-go'],
})
