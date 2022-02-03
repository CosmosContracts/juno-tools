import React from 'react'
import type { NextPage } from 'next'
import Link from 'next/link'
import { ImArrowRight2 } from 'react-icons/im'

const Home: NextPage = () => {
  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold">Merkle Drop</h1>

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/airdrops/create" passHref>
          <button className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">
              Create a New Airdrop
              <ImArrowRight2 className="ml-3" />
            </h3>
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/airdrops/register" passHref>
          <button className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">
              Register an Airdrop
              <ImArrowRight2 className="ml-3" />
            </h3>
          </button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 max-w-full sm:w-full">
        <Link href="/airdrops/fund" passHref>
          <button className="p-6 mt-6 text-left border border-secondary hover:border-primary w-96 rounded-xl hover:text-primary focus:text-primary-focus">
            <h3 className="text-2xl font-bold">
              Send Funds to an Airdrop
              <ImArrowRight2 className="ml-3" />
            </h3>
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home
