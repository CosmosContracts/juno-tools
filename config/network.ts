import type { AppConfig } from './app'

export const mainnetConfig: AppConfig = {
  chainId: 'juno-1',
  chainName: 'Juno',
  addressPrefix: 'juno',
  rpcUrl: 'https://rpc-juno.mib.tech',
  httpUrl: 'https://lcd-juno.itastakers.com/',
  feeToken: 'ujuno',
  stakingToken: 'ujuno',
  coinMap: {
    ujuno: { denom: 'JUNO', fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
}

export const uniTestnetConfig: AppConfig = {
  chainId: 'uni-6',
  chainName: 'Juno Testnet',
  addressPrefix: 'juno',
  rpcUrl: 'https://juno-testnet-rpc.polkachu.com/',
  httpUrl: 'https://juno-testnet-api.polkachu.com/',
  faucetUrl: 'https://faucet.uni.juno.deuslabs.fi',
  feeToken: 'ujunox',
  stakingToken: 'ujunox',
  coinMap: {
    ujunox: { denom: 'JUNOX', fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
}

export const getConfig = (network: string): AppConfig => {
  if (network === 'mainnet') return mainnetConfig
  return uniTestnetConfig
}
