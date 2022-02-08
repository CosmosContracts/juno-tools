import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { ImArrowRight2 } from 'react-icons/im'
import { useTheme } from 'contexts/theme'

const Home: NextPage = () => {
  const theme = useTheme()

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold text-center">Manage Airdrops</h1>

      <div className="text-center mt-10 text-xl">
        You can find the guide for managing your airdrops
        <a
          href="https://docs.juno.tools/docs/dashboards/airdrop/guide"
          target="_blank"
          rel="noreferrer"
          className="text-juno text-bold"
        >
          {' '}
          here
        </a>
      </div>

      <div className="mt-10">
        <div
          className={`flex flex-wrap items-center justify-around mt-6 max-w-full ${
            theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'
          }`}
        >
          <Link href="/airdrops/create" passHref>
            <button className="flex flex-col justify-center p-6 mt-6 items-center border w-72 rounded-xl">
              <h3 className="flex items-center text-2xl font-bold">
                Create Airdrop
              </h3>
            </button>
          </Link>
        </div>

        <div
          className={`flex flex-wrap items-center justify-around mt-6 max-w-full ${
            theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'
          }`}
        >
          <Link href="/airdrops/register" passHref>
            <button className="flex justify-center p-6 mt-6 items-center border w-72 rounded-xl">
              <h3 className="flex items-center text-2xl font-bold">
                Register Airdrop
              </h3>
            </button>
          </Link>
        </div>

        <div
          className={`flex flex-wrap items-center justify-around mt-6 max-w-full ${
            theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'
          }`}
        >
          <Link href="/airdrops/fund" passHref>
            <button className="flex justify-center p-6 mt-6 items-center border w-72 rounded-xl">
              <h3 className="flex items-center text-2xl font-bold">
                Fund Airdrop
              </h3>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
