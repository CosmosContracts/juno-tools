import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from 'contexts/wallet'
import { ContractsProvider } from 'contexts/contracts'
import { ThemeProvider } from 'contexts/theme'
import Layout from 'components/Layout'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [network, setNetwork] = useState('testnet')

  return (
    <ThemeProvider isDarkTheme={isDarkTheme} setIsDarkTheme={setIsDarkTheme}>
      <WalletProvider network={network} setNetwork={setNetwork}>
        <ContractsProvider>
          <Layout>
            <div>
              <Toaster position="top-center" />
            </div>
            <Component {...pageProps} />
          </Layout>
        </ContractsProvider>
      </WalletProvider>
    </ThemeProvider>
  )
}

export default MyApp
