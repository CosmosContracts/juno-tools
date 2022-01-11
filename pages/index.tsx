import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useKeplr } from 'services/keplr'
import { useWallet } from 'contexts/wallet'
import { useCallback } from 'react'

const Home: NextPage = () => {
  const keplr = useKeplr()
  const wallet = useWallet()

  const connectWallet = useCallback(() => keplr.connect(), [keplr])

  const disconnectWallet = () => {
    if (wallet.initialized) keplr.disconnect()
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Juno Tools</title>
        <meta name="description" content="Tooling dApp for Juno Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Juno Tools!</h1>

        <div className={styles.grid}>
          <button className={styles.card} onClick={connectWallet}>
            <h2>Connect Wallet &rarr;</h2>
          </button>

          <button className={styles.card} onClick={disconnectWallet}>
            <h2>Disconnect Wallet &rarr;</h2>
          </button>
        </div>

        {wallet.initialized && <div>{wallet.address}</div>}
        {wallet.initialized && <div>{JSON.stringify(wallet.balance)}</div>}
      </main>
    </div>
  )
}

export default Home
