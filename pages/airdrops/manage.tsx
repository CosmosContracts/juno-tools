import { useTheme } from 'contexts/theme'
import type { NextPage } from 'next'
import Link from 'next/link'
import React from 'react'
import { ImArrowRight2 } from 'react-icons/im'

const Home: NextPage = () => {
  const theme = useTheme()

  return (
    <div className="w-3/4 h-3/4">
      <h1 className="text-6xl font-bold text-center">Manage Airdrops</h1>

      <div className="mt-10 text-xl text-center">
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
            <button className="flex flex-col justify-center items-center p-6 mt-6 w-72 rounded-xl border">
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
            <button className="flex justify-center items-center p-6 mt-6 w-72 rounded-xl border">
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
            <button className="flex justify-center items-center p-6 mt-6 w-72 rounded-xl border">
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
