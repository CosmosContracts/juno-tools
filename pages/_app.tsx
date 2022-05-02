import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'
import '../styles/datepicker.css'

import { Layout } from 'components/Layout'
import { Modal } from 'components/Modal'
import { queryClient } from 'config/react-query'
import { ContractsProvider } from 'contexts/contracts'
import { WalletProvider } from 'contexts/wallet'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'
import { QueryClientProvider } from 'react-query'
import { getComponentMetadata } from 'utils/layout'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <ContractsProvider>
          <Toaster position="top-right" />
          <Layout metadata={getComponentMetadata(Component)}>
            <Component {...pageProps} />
            <Modal />
          </Layout>
        </ContractsProvider>
      </WalletProvider>
    </QueryClientProvider>
  )
}
