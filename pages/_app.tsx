import '@fontsource/jetbrains-mono/latin.css'
import '@fontsource/roboto/latin.css'
import '../styles/globals.css'

import Layout from 'components/Layout'
import { ContractsProvider } from 'contexts/contracts'
import { WalletProvider } from 'contexts/wallet'
import { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { useKeplr } from 'services/keplr'
import { NETWORK } from 'utils/constants'

const SideEffects = () => {
  const keplr = useKeplr()

  useEffect(() => {
    const listenKeystoreChange = () => keplr.connect(true)
    window.addEventListener('keplr_keystorechange', listenKeystoreChange)
    return () => {
      window.removeEventListener('keplr_keystorechange', listenKeystoreChange)
    }
  }, [keplr])

  return null
}

export default function App({ Component, pageProps }: AppProps) {
  const [network, setNetwork] = useState(NETWORK)

  return (
    <>
      <WalletProvider network={network} setNetwork={setNetwork}>
        <ContractsProvider>
          <Toaster position="top-right" />
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <SideEffects />
        </ContractsProvider>
      </WalletProvider>
    </>
  )
}
