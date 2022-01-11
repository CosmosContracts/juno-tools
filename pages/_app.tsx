import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from 'contexts/wallet'
import { ContractsProvider } from 'contexts/contracts'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [network, setNetwork] = useState('mainnet')

  return (
    <WalletProvider network={network} setNetwork={setNetwork}>
      <ContractsProvider>
        <div>
          <Toaster position="top-center" />
        </div>
        <Component {...pageProps} />
      </ContractsProvider>
    </WalletProvider>
  )
}

export default MyApp
