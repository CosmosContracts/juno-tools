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

const Sidebar: NextPage = () => {
  const theme = useTheme()
  const wallet = useWallet()
  const keplr = useKeplr()

  const changeThemeOnClick = () => {
    if (theme.theme === 'dark') theme.setTheme('light')
    else theme.setTheme('dark')
  }

  return (
    <div
      className={`w-72 h-full border-r-2 pt-5 pb-10 px-5 flex flex-col ${
        theme.theme === 'dark' && 'bg-dark'
      } ${theme.theme === 'dark' ? 'text-gray/75' : 'text-dark-gray/75'}
      ${theme.theme === 'dark' ? 'border-gray/20' : 'border-dark/20'}
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

      <button onClick={keplr.disconnect}>
        <div className="bg-gray/10 w-full h-14 flex items-center rounded-lg p-2 my-5">
          <BiWallet className="mr-2" size={24} />{' '}
          {getShortAddress(wallet.address)}
        </div>
      </button>

      <div className="mt-5">
        <Link href="/minting" passHref>
          <button className="text-left">
            <div className="mb-4 mono-font">Mint Tokens</div>
          </button>
        </Link>
        <div className="ml-3 mb-6">
          <Link href="/minting/cw20-base" passHref>
            <button className="flex items-center mb-4">
              <FiBox className="mr-2" /> CW20 base
            </button>
          </Link>
          <Link href="/minting/cw20-atomic-swap" passHref>
            <button className="flex items-center mb-4">
              <FiBox className="mr-2" /> CW20 Atomic Swap
            </button>
          </Link>
          <Link href="/minting/cw20-staking" passHref>
            <button className="flex items-center mb-4">
              <FiBox className="mr-2" /> CW20 Staking
            </button>
          </Link>
          <Link href="/minting/cw20-streams" passHref>
            <button className="flex items-center mb-4">
              <FiBox className="mr-2" /> CW20 Streams
            </button>
          </Link>
        </div>

        <Link href="/airdrops" passHref>
          <button className="text-left">
            <div className="mb-4 mono-font">Airdrop Tokens</div>
          </button>
        </Link>
      </div>

      <div className="flex-1"></div>

      <div className="mb-3 mono-font">JunoTools v0.1</div>
      <div className="ml-3">
        <button className="flex items-center" onClick={changeThemeOnClick}>
          {theme.theme === 'light' ? (
            <>
              <FiMoon className="mr-2" /> Night Theme
            </>
          ) : (
            <>
              <FiSun className="mr-2" /> Light Theme
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
