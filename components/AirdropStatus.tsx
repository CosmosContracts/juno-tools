import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { StackedList } from 'components/StackedList'
import type { AirdropProps } from 'utils/constants'
import { ESCROW_AMOUNT } from 'utils/constants'

export interface AirdropStatusProps {
  airdrop: AirdropProps
  contractAddress?: string
  page: string
}

export const AirdropStatus = (props: AirdropStatusProps) => {
  const { airdrop, contractAddress = '', page } = props

  return (
    <FormControl subtitle="View current airdrop statistics." title="Airdrop status">
      <StackedList>
        <StackedList.Item name="Airdrop Name">{airdrop.name}</StackedList.Item>

        <Conditional test={page === 'escrow'}>
          <StackedList.Item name="Escrow Status">
            <span className={clsx('block font-bold', airdrop.escrow ? 'text-plumbus' : 'text-green-500')}>
              {airdrop.escrow && (airdrop.escrowStatus === 'waiting' ? 'Not Completed' : 'Deposited')}
              {!airdrop.escrow && 'Completed'}
            </span>
            {!airdrop.escrow && (
              <span className="block text-sm">
                Your escrow is completed, you may now continue to{' '}
                <Anchor
                  className="font-bold text-plumbus hover:underline"
                  href={`/airdrops/register/?contractAddress=${contractAddress}`}
                >
                  register your airdrop
                </Anchor>
                .
              </span>
            )}
          </StackedList.Item>

          <StackedList.Item name="Escrow Deposit">{ESCROW_AMOUNT} juno</StackedList.Item>
        </Conditional>

        <Conditional test={page === 'register' || page === 'fund' || page === 'manage'}>
          <StackedList.Item name="Whitelist Generation">
            <span className={clsx('font-bold', airdrop.processing ? 'text-plumbus' : 'text-green-500')}>
              {airdrop.processing ? 'Processing' : 'Completed'}
            </span>
          </StackedList.Item>

          <StackedList.Item name="Whitelist Size">{airdrop.accountsSize} addresses</StackedList.Item>
        </Conditional>

        <Conditional test={page === 'register'}>
          <StackedList.Item name="Merkle Root">{airdrop.merkleRoot}</StackedList.Item>

          <StackedList.Item name="Start Value">{airdrop.start ? airdrop.start : 'None'}</StackedList.Item>

          <StackedList.Item name="Expiration Value">
            {airdrop.expiration ? airdrop.expiration : 'None'}
          </StackedList.Item>
        </Conditional>

        <StackedList.Item className="capitalize" name="Airdrop Latest Step">
          {airdrop.status ?? '...'}
        </StackedList.Item>

        <Conditional test={page === 'manage'}>
          {airdrop.expirationType === null && <StackedList.Item name="Expiration Time"> None </StackedList.Item>}
          {airdrop.expiration && airdrop.expirationType === 'timestamp' && (
            <StackedList.Item name="Expiration Time">
              {' '}
              {new Date(airdrop.expiration * 1000).toLocaleString()}{' '}
            </StackedList.Item>
          )}
          {airdrop.expiration && airdrop.expirationType === 'height' && (
            <StackedList.Item name="Expiration Height"> {airdrop.expiration} </StackedList.Item>
          )}
        </Conditional>
      </StackedList>
    </FormControl>
  )
}
