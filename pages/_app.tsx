import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'

import Layout from 'components/Layout'
import { ContractsProvider } from 'contexts/contracts'
import { ThemeProvider } from 'contexts/theme'
import { WalletProvider } from 'contexts/wallet'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { NETWORK } from 'utils/constants'

function MyApp({ Component, pageProps }: AppProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(true)
  const [network, setNetwork] = useState(NETWORK)

  return (
    <ThemeProvider isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme}>
      <WalletProvider network={network} setNetwork={setNetwork}>
        <ContractsProvider>
          <Toaster position="top-right" />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ContractsProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default MyApp
