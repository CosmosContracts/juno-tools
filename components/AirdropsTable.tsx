import clsx from 'clsx'
import Tooltip from 'components/Tooltip'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'
import { DetailedHTMLProps, TableHTMLAttributes } from 'react'
import toast from 'react-hot-toast'
import { copy } from 'utils/clipboard'

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

const getAirdropDate = (date: number, type: string | null) => {
  if (type === null) return '-'
  if (type === 'height') return date
  const d = new Date(date * 1000)
  return d.toLocaleDateString('en-US') + ' approx'
}

type BaseProps<T = HTMLTableElement> = DetailedHTMLProps<
  TableHTMLAttributes<T>,
  T
>

export interface AirdropsTableProps extends Omit<BaseProps, 'children'> {
  data: IAirdrop[]
}

const AirdropsTable = ({ data, className, ...rest }: AirdropsTableProps) => {
  const router = useRouter()
  const wallet = useWallet()

  const claimOnClick = (contractAddress: string) => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')
    router.push(`/airdrops/${contractAddress}/claim`)
  }

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
          <th className={clsx('p-4', { hidden: !wallet.address })}></th>
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
                    <Tooltip label="Click to copy wallet addreess">
                      <button
                        onClick={() => copy(airdrop.contractAddress)}
                        className="max-w-[32ch] font-mono text-xs text-white/50 hover:underline truncate"
                      >
                        {airdrop.contractAddress}
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
              <td
                className={clsx('p-4', {
                  hidden: !wallet.address || !airdrop.allocation,
                })}
              >
                <button
                  className={clsx(
                    'font-bold text-plumbus uppercase',
                    'py-1 px-4 rounded border border-plumbus',
                    'bg-plumbus/10 hover:bg-plumbus/20'
                  )}
                  onClick={() => claimOnClick(airdrop.contractAddress)}
                >
                  Claim
                </button>
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
