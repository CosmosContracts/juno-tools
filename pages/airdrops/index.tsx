import { useTheme } from 'contexts/theme'
import { NextPage } from 'next'
import Link from 'next/link'
import { ImArrowRight2 } from 'react-icons/im'

const Airdrop: NextPage = () => {
  const theme = useTheme()

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold text-center">Airdrop Tokens</h1>

      <div className="mt-5 text-center text-lg">
        Looking for a fast and efficient way to airdrop your project or come to
        claim your allocation? <br />
        Use our airdrop tool to create/claim your airdrop!
      </div>

      <div className="flex flex-col items-center justify-evenly h-3/4">
        <Link href="/airdrops/list" passHref>
          <button
            className={`${
              theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'
            } w-80 text-center`}
          >
            <div className="h-32 p-6 flex flex-col items-center border rounded-xl">
              <div className="flex items-center text-3xl font-bold mb-2">
                Claim Airdrops
              </div>
              View available airdrops
            </div>
          </button>
        </Link>
        <Link href="/airdrops/manage" passHref>
          <button
            className={`${
              theme.isDarkTheme ? 'border-gray/20' : 'border-dark/20'
            } w-80 text-center`}
          >
            <div className="h-32 p-6 flex flex-col items-center border rounded-xl">
              <div className="flex items-center text-3xl font-bold mb-2">
                Manage Airdrops
              </div>
              Create and fund new airdrops
            </div>
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Airdrop
