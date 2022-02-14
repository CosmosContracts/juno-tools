import Brand from 'assets/brand.svg'
import { useTheme } from 'contexts/theme'
import type { NextPage } from 'next'
import Link from 'next/link'

const Home: NextPage = () => {
  const theme = useTheme()

  return (
    <div className="w-3/4 h-3/4">
      <div className="flex flex-col justify-center items-center">
        <Brand className="max-w-lg" />
        <br />

        <div className="text-[4rem]">Welcome to JunoTools!</div>

        <div className="mt-3 text-xl text-center">
          JunoTools is a swiss knife that helps you build on Juno by providing
          smart contract front ends
          <div className="mt-3"></div>
          We call these front-end apps as{' '}
          <span className="font-bold text-juno">
            Smart Contact Dashboard
          </span>{' '}
          or <span className="font-bold text-juno">dashboard</span>
        </div>

        <div className="mt-14 text-xl text-center">
          Let&apos;s start with your first dashboard!
        </div>
        <Link href="/airdrops" passHref>
          <button
            className={`${theme.isDarkTheme ? 'bg-gray/10' : 'bg-dark-gray/10'}
            p-3 rounded-lg mt-5 px-10 text-2xl`}
          >
            Airdrops
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Home
