import clsx from 'clsx'
import Anchor from 'components/Anchor'
import FormControl from 'components/FormControl'
import StackedList from 'components/StackedList'
import { AirdropProps, ESCROW_AMOUNT } from 'utils/constants'
import { ellipsis } from 'utils/text'

export interface AirdropEscrowStatusProps {
  airdrop: AirdropProps
  contractAddress?: string
}

const AirdropEscrowStatus = (props: AirdropEscrowStatusProps) => {
  const { airdrop, contractAddress = '' } = props

  return (
    <FormControl
      title="Airdrop escrow status"
      subtitle="View current CW20 token airdrop statistics."
    >
      <StackedList>
        <StackedList.Item name="Escrow Status">
          <span
            className={clsx(
              'block font-bold',
              airdrop?.escrow ? 'text-plumbus' : 'text-green-500'
            )}
          >
            {airdrop?.escrow
              ? airdrop.escrowStatus ?? 'Not Completed'
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

        <StackedList.Item name="Airdrop Status" className="capitalize">
          {airdrop?.status ?? '...'}
        </StackedList.Item>

        <StackedList.Item name="Processing" className="capitalize">
          {ellipsis(airdrop?.processing, String(airdrop?.processing))}
        </StackedList.Item>
      </StackedList>
    </FormControl>
  )
}

export default AirdropEscrowStatus
