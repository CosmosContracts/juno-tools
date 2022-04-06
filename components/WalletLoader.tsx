import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useWallet, useWalletStore } from 'contexts/wallet'
import { Fragment, VFC } from 'react'
import { FaCopy, FaPowerOff, FaRedo } from 'react-icons/fa'
import { copy } from 'utils/clipboard'
import getShortAddress from 'utils/getShortAddress'

import { WalletButton } from './WalletButton'
import { WalletPanelButton } from './WalletPanelButton'

export const WalletLoader: VFC = () => {
  const wallet = useWallet()

  const connect = useWalletStore((store) => store.connect)
  const disconnect = useWalletStore((store) => store.disconnect)
  const isLoading = useWalletStore((store) => store.initializing)
  const isReady = useWalletStore((store) => store.initialized)

  const displayName = useWalletStore(
    (store) => store.name || getShortAddress(store.address)
  )

  return (
    <Popover className="my-8">
      {({ close }) => (
        <Fragment>
          <div className="grid -mx-4">
            {!isReady && (
              <WalletButton
                className="w-full"
                isLoading={isLoading}
                onClick={() => connect()}
              >
                Connect Wallet
              </WalletButton>
            )}

            {isReady && (
              <Popover.Button
                className="w-full"
                as={WalletButton}
                isLoading={isLoading}
              >
                {displayName}
              </Popover.Button>
            )}
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Popover.Panel
              className={clsx(
                'absolute inset-x-4 mt-2',
                'bg-stone-800/80 rounded shadow-lg shadow-black/90 backdrop-blur-sm',
                'flex flex-col items-stretch text-sm divide-y divide-white/10'
              )}
            >
              <div className="flex flex-col items-center py-2 px-4 space-y-1 text-center">
                <span className="py-px px-2 mb-2 font-mono text-xs text-white/50 rounded-full border border-white/25">
                  {getShortAddress(wallet.address)}
                </span>
                <div className="font-bold">Your Balances</div>
                {wallet.balance.map((val) => (
                  <span key={`balance-${val.denom}`}>
                    {val.amount} {val.denom}
                  </span>
                ))}
              </div>
              <WalletPanelButton
                Icon={FaCopy}
                onClick={() => copy(wallet.address)}
              >
                Copy wallet address
              </WalletPanelButton>
              <WalletPanelButton Icon={FaRedo} onClick={() => connect()}>
                Reconnect
              </WalletPanelButton>
              <WalletPanelButton
                Icon={FaPowerOff}
                onClick={() => (disconnect(), close())}
              >
                Disconnect
              </WalletPanelButton>
            </Popover.Panel>
          </Transition>
        </Fragment>
      )}
    </Popover>
  )
}

export default WalletLoader
