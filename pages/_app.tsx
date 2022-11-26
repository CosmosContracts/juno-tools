import '../styles/globals.css'

import { ChakraProvider } from '@chakra-ui/react'
import type { SignerOptions } from '@cosmos-kit/core'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { WalletProvider } from '@cosmos-kit/react'
import { assets, chains } from 'chain-registry'
import type { AppProps } from 'next/app'

import { defaultTheme } from '../config/theme'

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const signerOptions: SignerOptions = {
    // stargate: (_chain: Chain) => {
    //   return getSigningCosmosClientOptions();
    // }
  }

  return (
    <ChakraProvider theme={defaultTheme}>
      <WalletProvider assetLists={assets} chains={chains} signerOptions={signerOptions} wallets={[...keplrWallets]}>
        <Component {...pageProps} />
      </WalletProvider>
    </ChakraProvider>
  )
}

export default CreateCosmosApp
