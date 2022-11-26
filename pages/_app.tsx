import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'
import '../styles/datepicker.css'

import { ChakraProvider } from '@chakra-ui/react'
import type { SignerOptions } from '@cosmos-kit/core'
import { wallets as keplrWallets } from '@cosmos-kit/keplr'
import { WalletProvider } from '@cosmos-kit/react'
import type { WalletControllerChainOptions } from '@terra-money/wallet-provider'
import { assets, chains } from 'chain-registry'
import { Layout } from 'components/Layout'
import { Modal } from 'components/Modal'
import { ContractsProvider } from 'contexts/contracts'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { getComponentMetadata } from 'utils/layout'

import { defaultTheme } from '../config/theme'

export default function App({
  Component,
  pageProps,
  defaultNetwork,
  walletConnectChainIds,
}: AppProps & WalletControllerChainOptions) {
  const signerOptions: SignerOptions = {
    // stargate: (_chain: Chain) => {
    //   return getSigningCosmosClientOptions();
    // }
  }

  // TODO: Is this necessary? Look into it
  return typeof window !== 'undefined' ? (
    <ChakraProvider resetCSS={false} theme={defaultTheme}>
      <WalletProvider assetLists={assets} chains={chains} signerOptions={signerOptions} wallets={[...keplrWallets]}>
        <ContractsProvider>
          <Toaster position="top-right" />
          <Layout metadata={getComponentMetadata(Component)}>
            <Component {...pageProps} />
            <Modal />
          </Layout>
        </ContractsProvider>
      </WalletProvider>
    </ChakraProvider>
  ) : (
    <ChakraProvider resetCSS={false} theme={defaultTheme}>
      <WalletProvider assetLists={assets} chains={chains} signerOptions={signerOptions} wallets={[...keplrWallets]}>
        <ContractsProvider>
          <Toaster position="top-right" />
          <Layout metadata={getComponentMetadata(Component)}>
            <Component {...pageProps} />
            <Modal />
          </Layout>
        </ContractsProvider>
      </WalletProvider>
    </ChakraProvider>
  )
}
