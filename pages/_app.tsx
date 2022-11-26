import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'
import '../styles/datepicker.css'

import type { SignerOptions } from '@cosmos-kit/core'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { WalletProvider } from '@cosmos-kit/react'
import { assets, chains } from 'chain-registry'
import type { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    // stargate: (_chain: Chain) => {
    //   return getSigningCosmosClientOptions();
    // }
  }
  return (
    <WalletProvider assetLists={assets} chains={chains} signerOptions={signerOptions} wallets={[...keplrWallets]}>
      <Component {...pageProps} />
    </WalletProvider>
  )
}
