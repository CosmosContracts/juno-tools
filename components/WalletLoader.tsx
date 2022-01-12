import { NextPage } from 'next'
import { useCallback } from 'react'
import { useKeplr } from 'services/keplr'

const WalletLoader: NextPage = () => {
  const keplr = useKeplr()

  const connectWallet = useCallback(() => keplr.connect(), [keplr])

  return (
    <button onClick={connectWallet}>
      <h2>Connect Wallet &rarr;</h2>
    </button>
  )
}

export default WalletLoader
