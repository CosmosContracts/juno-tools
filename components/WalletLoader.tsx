/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Popover, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useWallet, useWalletStore } from 'contexts/wallet'
import { Fragment } from 'react'
import { FaCopy, FaPowerOff, FaRedo } from 'react-icons/fa'
import { copy } from 'utils/clipboard'
import { convertDenomToReadable } from 'utils/convertDenomToReadable'
import { getShortAddress } from 'utils/getShortAddress'

import { WalletButton } from './WalletButton'
import { WalletPanelButton } from './WalletPanelButton'

export const WalletLoader = () => {
  const {
    address,
    balance,
    connect,
    disconnect,
    initializing: isLoading,
    initialized: isReady,
    setWalletType,
  } = useWallet()

  const displayName = useWalletStore((store) => store.name || getShortAddress(store.address))

  return (
    <Popover className="my-8">
      {({ close }) => (
        <>
          <div className="grid -mx-4">
            {!isReady && (
              <WalletButton className="w-full" isLoading={isLoading}>
                <label className="py-2 pr-10 w-full h-full modal-button" htmlFor="my-modal-4">
                  Connect Wallet
                </label>
              </WalletButton>
            )}

            {isReady && (
              <Popover.Button as={WalletButton} className="w-full" isLoading={isLoading}>
                {displayName}
              </Popover.Button>
            )}
            <input className="modal-toggle" id="my-modal-4" type="checkbox" />
            <label className="cursor-pointer modal" htmlFor="my-modal-4">
              <label className="relative rounded-md border-2 border-plumbus/60 modal-box" htmlFor="">
                <button
                  className="mb-5 w-full h-16 font-bold text-center bg-opacity-0 rounded-md border-2 border-plumbus"
                  onClick={() => setWalletType('keplr')}
                >
                  <label className="flex w-full text-white hover:bg-opacity-0 border-0 px-26" htmlFor="my-modal-4">
                    <div className="flex justify-center items-center w-full">
                      <img alt="keplr logo" className="mr-3 w-[45px] h-[45px]" src="/keplr.png" />
                      Connect with Keplr Wallet
                    </div>
                  </label>
                </button>
                <button
                  className="w-full h-16 font-bold text-center bg-opacity-0 hover:bg-opacity-20 rounded-md border-2 border-plumbus"
                  onClick={() => setWalletType('falcon')}
                >
                  <label className="flex w-full text-white hover:bg-opacity-0 border-0 px-26" htmlFor="my-modal-4">
                    <div className="flex justify-center items-center ml-2 w-full">
                      <img alt="falcon logo" className="mr-3 w-[45px] h-[45px]" src="/falcon.png" />
                      Connect with Falcon Wallet
                    </div>
                  </label>
                </button>
              </label>
            </label>
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
                'flex flex-col items-stretch text-sm divide-y divide-white/10',
              )}
            >
              <div className="flex flex-col items-center py-2 px-4 space-y-1 text-center">
                <span className="py-px px-2 mb-2 font-mono text-xs text-white/50 rounded-full border border-white/25">
                  {getShortAddress(address)}
                </span>
                <div className="font-bold">Your Balances</div>
                {balance.map((val) => (
                  <span key={`balance-${val.denom}`}>
                    {convertDenomToReadable(val.amount)} {val.denom.slice(1, val.denom.length)}
                  </span>
                ))}
              </div>
              <WalletPanelButton Icon={FaCopy} onClick={() => void copy(address)}>
                Copy wallet address
              </WalletPanelButton>
              <WalletPanelButton Icon={FaRedo} onClick={() => void connect()}>
                Reconnect
              </WalletPanelButton>
              <WalletPanelButton Icon={FaPowerOff} onClick={() => [disconnect(), close()]}>
                Disconnect
              </WalletPanelButton>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
