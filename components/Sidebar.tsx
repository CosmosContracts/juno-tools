import { useCallback, useEffect } from 'react'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ImArrowUpRight2 } from 'react-icons/im'
import { FiMoon, FiSun, FiBox } from 'react-icons/fi'
import { BiWallet } from 'react-icons/bi'
import { useTheme } from 'contexts/theme'
import getShortAddress from 'utils/getShortAddress'
import { useKeplr } from 'services/keplr'
import { useRouter } from 'next/router'

const Sidebar: NextPage = () => {
  const router = useRouter()
  const theme = useTheme()
  const wallet = useWallet()
  const keplr = useKeplr()

  const changeThemeOnClick = () => {
    theme.setIsDarkTheme(!theme.isDarkTheme)
  }

  const activeColor = theme.isDarkTheme ? 'bg-purple/25' : 'bg-purple/10'
  const walletText = wallet.initialized
    ? wallet.name || getShortAddress(wallet.address)
    : 'Connect Wallet'

  useEffect(() => {
    // Used for listening keplr account changes
    window.addEventListener('keplr_keystorechange', () => {
      keplr.connect(true)
    })
  }, [])

  const connectWallet = useCallback(() => keplr.connect(), [keplr])

  const walletOnClick = () => {
    if (wallet.initialized) {
      keplr.disconnect()
    } else {
      connectWallet()
    }
  }

  return (
    <div
      className={`w-72 h-full border-r-2 pt-5 pb-10 px-5 flex flex-col ${
        theme.isDarkTheme && 'bg-dark'
      } ${theme.isDarkTheme ? 'text-gray/75' : 'text-dark-gray/75'}
      ${theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'}
      `}
    >
      <Link href="/" passHref>
        <button className="w-10 rounded-full">
          <Image
            src="/juno_logo.png"
            alt="logo"
            width={100}
            height={100}
            className="rounded-full"
          />
        </button>
      </Link>

      <button
        onClick={walletOnClick}
        className={`${
          theme.isDarkTheme ? 'bg-gray/10' : 'bg-dark-gray/10'
        } w-full h-14 flex items-center rounded-lg p-2 my-5`}
      >
        {keplr.initializing ? (
          <div className="flex items-center justify-center w-full">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            <BiWallet className="mr-2" size={24} /> {walletText}
          </>
        )}
      </button>

      <div className="mt-5">
        <Link href="/minting" passHref>
          <button className="text-left">
            <div className="mb-4 mono-font">Mint CW20 Tokens</div>
          </button>
        </Link>
        <div className="mb-5">
          <Link href="/contracts/cw20-base" passHref>
            <button
              className={`flex items-center mb-1 w-full p-2 rounded-lg ${
                router.pathname.includes('/contracts/cw20-base')
                  ? activeColor
                  : ''
              }`}
            >
              <FiBox className="mr-2" /> Base
            </button>
          </Link>
          <Link href="/contracts/cw20-bonding" passHref>
            <button
              className={`flex items-center mb-1 w-full p-2 rounded-lg ${
                router.pathname.includes('/contracts/cw20-bonding')
                  ? activeColor
                  : ''
              }`}
            >
              <FiBox className="mr-2" /> Bonding
            </button>
          </Link>
          <Link href="/contracts/cw20-staking" passHref>
            <button
              className={`flex items-center mb-1 w-full p-2 rounded-lg ${
                router.pathname.includes('/contracts/cw20-staking')
                  ? activeColor
                  : ''
              }`}
            >
              <FiBox className="mr-2" /> Staking
            </button>
          </Link>
        </div>

        <Link href="/contracts/cw1-subkeys" passHref>
          <button className="text-left">
            <div className="mb-4 mono-font">CW1 Subkeys</div>
          </button>
        </Link>

        <Link href="/airdrops" passHref>
          <button className="text-left">
            <div className="mt-5 mono-font">Airdrop Tokens</div>
          </button>
        </Link>
      </div>

      <div className="flex-1"></div>

      <div className="mb-3 mono-font">JunoTools v0.1</div>
      <div className="ml-3">
        <button className="flex items-center" onClick={changeThemeOnClick}>
          {theme.isDarkTheme ? (
            <>
              <FiSun className="mr-2" /> Light Theme
            </>
          ) : (
            <>
              <FiMoon className="mr-2" /> Night Theme
            </>
          )}
        </button>
        <a href="https://www.junonetwork.io/" target="_blank" rel="noreferrer">
          <button className="flex items-center my-4">
            <ImArrowUpRight2 className="mr-2" /> Powered by Juno
          </button>
        </a>
        <button className="flex items-center">
          <ImArrowUpRight2 className="mr-2" /> Help and Feedback
        </button>
      </div>
    </div>
  )
}

export default Sidebar
