import clsx from 'clsx'
import { useWallet } from 'contexts/wallet'
import { useEffect } from 'react'
import { BiWallet } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'
import { useKeplr } from 'services/keplr'
import getShortAddress from 'utils/getShortAddress'

const WalletLoader = () => {
  const keplr = useKeplr()
  const wallet = useWallet()

  const handleClick = () => {
    return (wallet.initialized ? keplr.disconnect : keplr.connect)(true)
  }

  useEffect(() => {
    const walletAddress = localStorage.getItem('wallet_address')
    if (walletAddress) {
      keplr.connect()
    }
  }, [])

  return (
    <button
      className={clsx(
        'flex gap-x-2 items-center text-sm font-bold uppercase truncate', // content styling
        'py-2 px-4 my-8 border border-plumbus', // button styling
        'hover:bg-white/10 transition-colors', // hover styling
        { 'cursor-wait': keplr.initializing } // loading styling
      )}
      disabled={keplr.initializing}
      onClick={handleClick}
    >
      {keplr.initializing ? (
        <FaSpinner size={16} className="animate-spin" />
      ) : (
        <BiWallet size={16} />
      )}

      <span>
        {wallet.initialized
          ? wallet.name || getShortAddress(wallet.address)
          : keplr.initializing
          ? 'Loading...'
          : 'Connect Wallet'}
      </span>
    </button>
  )
}

export default WalletLoader
