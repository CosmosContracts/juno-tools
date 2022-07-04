import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'
import '../styles/datepicker.css'

import type { WalletControllerChainOptions } from '@terra-money/wallet-provider'
import { StaticWalletProvider, WalletProvider } from '@terra-money/wallet-provider'
import { Layout } from 'components/Layout'
import { Modal } from 'components/Modal'
import { queryClient } from 'config/react-query'
import { ContractsProvider } from 'contexts/contracts'
import { WalletProvider as KeplrWalletProvider } from 'contexts/wallet'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { getComponentMetadata } from 'utils/layout'

export default function App({
  Component,
  pageProps,
  defaultNetwork,
  walletConnectChainIds,
}: AppProps & WalletControllerChainOptions) {
  // TODO: Is this necessary? Look into it
  return typeof window !== 'undefined' ? (
    <WalletProvider defaultNetwork={defaultNetwork} walletConnectChainIds={walletConnectChainIds}>
      <QueryClientProvider client={queryClient}>
        <KeplrWalletProvider>
          <ContractsProvider>
            <Toaster position="top-right" />
            <Layout metadata={getComponentMetadata(Component)}>
              <Component {...pageProps} />
              <Modal />
            </Layout>
          </ContractsProvider>
        </KeplrWalletProvider>
      </QueryClientProvider>
    </WalletProvider>
  ) : (
    <StaticWalletProvider defaultNetwork={defaultNetwork}>
      <QueryClientProvider client={queryClient}>
        <KeplrWalletProvider>
          <ContractsProvider>
            <Toaster position="top-right" />
            <Layout metadata={getComponentMetadata(Component)}>
              <Component {...pageProps} />
              <Modal />
            </Layout>
          </ContractsProvider>
        </KeplrWalletProvider>
      </QueryClientProvider>
    </StaticWalletProvider>
  )
}
