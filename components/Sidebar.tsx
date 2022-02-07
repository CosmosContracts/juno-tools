import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ImArrowUpRight2, ImGithub, ImTwitter } from 'react-icons/im'
import { FiMoon, FiSun, FiBox } from 'react-icons/fi'
import { SiDiscord, SiTelegram } from 'react-icons/si'
import { BiWallet } from 'react-icons/bi'
import { useTheme } from 'contexts/theme'
import getShortAddress from 'utils/getShortAddress'
import { loadKeplrWallet, useKeplr } from 'services/keplr'
import { useRouter } from 'next/router'
import { getConfig } from 'config'

const Sidebar: NextPage = () => {
  const router = useRouter()
  const theme = useTheme()
  const wallet = useWallet()
  const keplr = useKeplr()

  const activeColor = theme.isDarkTheme ? 'bg-purple/25' : 'bg-purple/10'
  const walletText = wallet.initialized
    ? wallet.name || getShortAddress(wallet.address)
    : 'Connect Wallet'

  const changeThemeOnClick = () => {
    theme.setIsDarkTheme(!theme.isDarkTheme)
  }

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
      className={`min-w-[250px] h-full border-r-2 pt-5 pb-8 px-5 flex flex-col ${
        theme.isDarkTheme && 'bg-dark'
      } ${theme.isDarkTheme ? 'text-gray/75' : 'text-dark-gray/75'}
      ${theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'}
      `}
    >
      <Link href="/" passHref>
        <button className="flex w-13 rounded-full items-center">
          <img
            src="/logo.png"
            alt="logo"
            width={55}
            height={55}
            className="rounded-full"
          />
          <span
            className={`${
              theme.isDarkTheme ? 'text-gray/75' : 'text-dark-gray/75'
            } text-2xl ml-2 font-bold font-[Lato]`}
          >
            JunoTools
          </span>
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

      <div className="my-4">
        <Link href="/airdrops" passHref>
          <button
            className={`flex items-center mb-1 w-full rounded-lg p-2 ${
              router.pathname.includes('/airdrops') ? activeColor : ''
            }`}
          >
            <div className="mono-font">Airdrops</div>
          </button>
        </Link>
      </div>

      <div>
        <Link href="/contracts/cw20" passHref>
          <button className="text-left opacity-50 p-2" disabled>
            <div className="mb-4 mono-font">CW20 - Soon</div>
          </button>
        </Link>
        {/* <div className="mb-5">
          <Link href="/contracts/cw20/base" passHref>
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
          <Link href="/contracts/cw20/bonding" passHref>
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
          <Link href="/contracts/cw20/staking" passHref>
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
        </div> */}

        <div /* className="my-5" */>
          <Link href="/contracts/cw1" passHref>
            <button className="text-left opacity-50 p-2" disabled>
              <div className="mb-4 mono-font">CW1 - Soon</div>
            </button>
          </Link>

          {/* <div className="mb-5">
            <Link href="/contracts/cw1/subkeys" passHref>
              <button
                className={`flex items-center mb-1 w-full p-2 rounded-lg ${
                  router.pathname.includes('/contracts/cw1-subkeys')
                    ? activeColor
                    : ''
                }`}
              >
                <FiBox className="mr-2" /> Subkeys
              </button>
            </Link>
          </div> */}
        </div>

        <div /* className="my-5" */>
          <Link href="/contracts/cw1" passHref>
            <button className="text-left opacity-50 p-2" disabled>
              <div className="mb-4 mono-font">CW721 - Soon</div>
            </button>
          </Link>
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="mb-3 mono-font">JunoTools v0.1.0-beta</div>
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
          <button className="flex items-center my-3">
            <ImArrowUpRight2 className="mr-2" /> Powered by Juno
          </button>
        </a>
        <a href="https://deuslabs.fi" target="_blank" rel="noreferrer">
          <button className="flex items-center">
            <ImArrowUpRight2 className="mr-2" /> Made by deus labs
          </button>
        </a>
      </div>
      <div className="mt-5 flex items-center justify-evenly">
        <a href="https://discord.gg/Juno" target="_blank" rel="noreferrer">
          <button className="flex items-center">
            <SiDiscord size={20} />
          </button>
        </a>
        <a
          href="https://t.me/JunoNetwork"
          target="_blank"
          rel="noreferrer"
          className="ml-5"
        >
          <button className="flex items-center">
            <SiTelegram size={20} />
          </button>
        </a>
        <a
          href="https://twitter.com/junotools"
          target="_blank"
          rel="noreferrer"
          className="ml-5"
        >
          <button className="flex items-center">
            <ImTwitter size={20} />
          </button>
        </a>
        <a
          href="https://github.com/CosmosContracts/juno-tools"
          target="_blank"
          rel="noreferrer"
          className="ml-5"
        >
          <button className="flex items-center">
            <ImGithub size={20} />
          </button>
        </a>
      </div>
    </div>
  )
}

export default Sidebar
