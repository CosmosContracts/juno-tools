import clsx from 'clsx'
import Anchor from 'components/Anchor'
import FormControl from 'components/FormControl'
import StackedList from 'components/StackedList'
import { AirdropProps, ESCROW_AMOUNT } from 'utils/constants'

export interface AirdropStatusProps {
  airdrop: AirdropProps
  contractAddress?: string
}

const AirdropStatus = (props: AirdropStatusProps) => {
  const { airdrop, contractAddress = '' } = props

  return (
    <FormControl
      title="Airdrop status"
      subtitle="View current airdrop statistics."
    >
      <StackedList>
        <StackedList.Item name="Escrow Status" className="capitalize">
          <span
            className={clsx(
              'block font-bold',
              airdrop?.escrow ? 'text-plumbus' : 'text-green-500'
            )}
          >
            {airdrop?.escrow
              ? airdrop?.escrowStatus === 'waiting'
                ? 'Not Completed'
                : 'Deposited'
              : 'Completed'}
          </span>
          {!airdrop?.escrow && (
            <span className="block text-sm">
              Your escrow is completed, you may now continue to{' '}
              <Anchor
                href={`/airdrops/register/?contractAddress=${contractAddress}`}
                className="font-bold text-plumbus hover:underline"
              >
                register your airdrop
              </Anchor>
              .
            </span>
          )}
        </StackedList.Item>

        <StackedList.Item name="Escrow Deposit">
          {ESCROW_AMOUNT} juno
        </StackedList.Item>

        <StackedList.Item name="Airdrop Latest Step" className="capitalize">
          {airdrop?.status ?? '...'}
        </StackedList.Item>
      </StackedList>
    </FormControl>
  )
}

export default AirdropStatus
