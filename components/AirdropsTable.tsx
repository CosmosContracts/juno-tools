import clsx from 'clsx'
import Tooltip from 'components/Tooltip'
import { useWallet } from 'contexts/wallet'
import { DetailedHTMLProps, TableHTMLAttributes } from 'react'
import { FaCopy } from 'react-icons/fa'
import { getAirdropDate } from 'utils/airdrop'
import { copy } from 'utils/clipboard'
import { truncateMiddle } from 'utils/text'

import AnchorButton from './AnchorButton'

export interface IAirdrop {
  name: string
  contractAddress: string
  totalAmount: number
  claimed: number
  allocation: number
  start: number
  startType: string
  expiration: number
  expirationType: string
  logo: { url: string } | null
}

type BaseProps<T = HTMLTableElement> = DetailedHTMLProps<
  TableHTMLAttributes<T>,
  T
>

export interface AirdropsTableProps extends Omit<BaseProps, 'children'> {
  data: IAirdrop[]
}

const AirdropsTable = ({ data, className, ...rest }: AirdropsTableProps) => {
  const wallet = useWallet()

  return (
    <table className={clsx('min-w-full', className)} {...rest}>
      <thead className="sticky inset-x-0 top-0 bg-plumbus-dark/50 backdrop-blur-sm">
        <tr className="text-left text-plumbus-matte">
          <th className="p-4">Name</th>
          <th className="p-4 text-right">Amount</th>
          <th className="p-4 text-right">Claimed</th>
          <th className="p-4 text-right">Allocation</th>
          <th className="p-4">Start</th>
          <th className="p-4">End</th>
          <th className={clsx('p-4', { invisible: !wallet.address })}></th>
        </tr>
      </thead>

      <tbody className="divide-y divide-white/20">
        {data.length > 0 ? (
          data.map((airdrop, i) => (
            <tr
              key={`airdrop-${i}`}
              className="hover:bg-white/5"
              id={airdrop.contractAddress}
            >
              <td className="p-4">
                <div className="flex items-center space-x-4 font-medium">
                  <div className="w-8 min-w-max h-8 min-h-max">
                    <img
                      src={airdrop.logo?.url ?? '/juno_logo.png'}
                      alt={airdrop.name}
                      className="overflow-hidden w-8 h-8 bg-plumbus rounded-full"
                    />
                  </div>
                  <div>
                    <div>{airdrop.name}</div>
                    <Tooltip label="Click to copy contract addreess">
                      <button
                        onClick={() => copy(airdrop.contractAddress)}
                        className="group flex space-x-2 font-mono text-xs text-white/50 hover:underline"
                      >
                        <span>
                          {truncateMiddle(airdrop.contractAddress, 32)}
                        </span>
                        <FaCopy className="opacity-50 group-hover:opacity-100" />
                      </button>
                    </Tooltip>
                  </div>
                </div>
              </td>
              <td className="p-4 text-right">
                {airdrop.totalAmount.toLocaleString('en')}
              </td>
              <td className="p-4 text-right">
                {airdrop.claimed.toLocaleString('en')}
              </td>
              <td className="p-4 text-right">
                {airdrop.allocation?.toLocaleString('en') || '-'}
              </td>
              <td className="p-4">
                {getAirdropDate(airdrop.start, airdrop.startType)}
              </td>
              <td className="p-4">
                {getAirdropDate(airdrop.expiration, airdrop.expirationType)}
              </td>
              <td className="p-4">
                <div className="flex">
                  <AnchorButton
                    className={clsx({
                      invisible: !wallet.address || !airdrop.allocation,
                    })}
                    href={`/airdrops/${airdrop.contractAddress}/claim`}
                    variant="outline"
                  >
                    CLAIM
                  </AnchorButton>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6} className="p-4 text-center text-white/50">
              No airdrops available :(
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

export default AirdropsTable
