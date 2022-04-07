import clsx from 'clsx'
import { useWallet } from 'contexts/wallet'
import { BiWallet } from 'react-icons/bi'
import { FaSpinner } from 'react-icons/fa'
import getShortAddress from 'utils/getShortAddress'

const WalletLoader = () => {
  const wallet = useWallet()

  const handleClick = () => {
    return (wallet.initialized ? wallet.disconnect : wallet.connect)(true)
  }

  return (
    <button
      className={clsx(
        'flex gap-x-2 items-center text-sm font-bold uppercase truncate', // content styling
        'py-2 px-4 my-8 border border-plumbus', // button styling
        'hover:bg-white/10 transition-colors', // hover styling
        { 'cursor-wait': wallet.initializing } // loading styling
      )}
      disabled={wallet.initializing}
      onClick={handleClick}
    >
      {wallet.initializing ? (
        <FaSpinner size={16} className="animate-spin" />
      ) : (
        <BiWallet size={16} />
      )}

      <span>
        {wallet.initializing
          ? 'Loading...'
          : wallet.initialized
          ? wallet.name || getShortAddress(wallet.address)
          : 'Connect Wallet'}
      </span>
    </button>
  )
}

export default WalletLoader
