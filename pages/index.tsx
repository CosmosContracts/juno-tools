import type { NextPage } from 'next'
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
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Juno Tools!</h1>

        {wallet.initialized && <div>{wallet.address}</div>}
        {wallet.initialized && <div>{JSON.stringify(wallet.balance)}</div>}
      </main>
    </div>
  )
}

export default Home
