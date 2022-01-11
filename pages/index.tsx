import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

const Home: NextPage = () => {
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
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h2>Connect Wallet &rarr;</h2>
          </a>

          <a href="https://nextjs.org/learn" className={styles.card}>
            <h2>Disconnect Wallet &rarr;</h2>
          </a>
        </div>
      </main>
    </div>
  )
}

export default Home
