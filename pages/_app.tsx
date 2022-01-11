import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { WalletProvider } from 'contexts/wallet'
import { Toaster } from 'react-hot-toast'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WalletProvider>
      <div>
        <Toaster position="top-center" />
      </div>
      <Component {...pageProps} />
    </WalletProvider>
  )
}

export default MyApp
