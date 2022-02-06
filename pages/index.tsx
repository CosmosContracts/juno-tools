import type { NextPage } from 'next'
import styles from '../styles/Home.module.css'
import { useWallet } from 'contexts/wallet'

const Home: NextPage = () => {
  const wallet = useWallet()

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className="text-[4rem]">Welcome to Juno Tools!</div>

        {wallet.initialized && <div>{wallet.address}</div>}
        {wallet.initialized && <div>{JSON.stringify(wallet.balance)}</div>}
      </main>
    </div>
  )
}

export default Home
