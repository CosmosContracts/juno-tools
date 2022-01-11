import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from 'contexts/wallet'
import { Toaster } from 'react-hot-toast'
import { useState } from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  const [network, setNetwork] = useState('mainnet')

  return (
    <WalletProvider network={network} setNetwork={setNetwork}>
      <div>
        <Toaster position="top-center" />
      </div>
      <Component {...pageProps} />
    </WalletProvider>
  )
}

export default MyApp
