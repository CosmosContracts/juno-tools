import clsx from 'clsx'
import Anchor from 'components/Anchor'
import FormControl from 'components/FormControl'
import StackedList from 'components/StackedList'
import { AirdropProps, ESCROW_AMOUNT } from 'utils/constants'

export interface AirdropStatusProps {
  airdrop: AirdropProps
  contractAddress?: string
  page: string
}

const AirdropStatus = (props: AirdropStatusProps) => {
  const { airdrop, contractAddress = '', page } = props

  return (
    <FormControl
      title="Airdrop status"
      subtitle="View current airdrop statistics."
    >
      <StackedList>
        <StackedList.Item name="Airdrop Name">{airdrop.name}</StackedList.Item>

        {page === 'escrow' && (
          <>
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
          </>
        )}

        {(page === 'register' || page === 'fund') && (
          <>
            <StackedList.Item name="Whitelist Generation">
              <span
                className={clsx(
                  'font-bold',
                  airdrop.processing ? 'text-plumbus' : 'text-green-500'
                )}
              >
                {airdrop.processing ? 'Processing' : 'Completed'}
              </span>
            </StackedList.Item>

            <StackedList.Item name="Whitelist Size">
              {airdrop.accountsSize} addresses
            </StackedList.Item>
          </>
        )}

        {page === 'register' && (
          <>
            <StackedList.Item name="Merkle Root">
              {airdrop.merkleRoot}
            </StackedList.Item>

            <StackedList.Item name="Start Value">
              {airdrop.start ? airdrop.start : 'None'}
            </StackedList.Item>

            <StackedList.Item name="Expiration Value">
              {airdrop.expiration ? airdrop.expiration : 'None'}
            </StackedList.Item>
          </>
        )}

        <StackedList.Item name="Airdrop Latest Step" className="capitalize">
          {airdrop?.status ?? '...'}
        </StackedList.Item>
      </StackedList>
    </FormControl>
  )
}

export default AirdropStatus
