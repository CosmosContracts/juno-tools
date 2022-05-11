import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput } from 'components/forms/FormInput'
import { useEffect, useId, useMemo } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

import { useInputState } from './FormInput.hooks'

export interface Balance {
  address: string
  amount: string
}

export interface AddressBalancesProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  entries: [string, Balance][]
  onAdd: () => void
  onChange: (key: string, balance: Balance) => void
  onRemove: (key: string) => void
}

export function AddressBalances(props: AddressBalancesProps) {
  const { title, subtitle, isRequired, entries, onAdd, onChange, onRemove } = props
  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {entries.map(([id], i) => (
        <AddressBalance
          key={`ib-${id}`}
          id={id}
          isLast={i === entries.length - 1}
          onAdd={onAdd}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
    </FormControl>
  )
}

export interface AddressBalanceProps {
  id: string
  isLast: boolean
  onAdd: AddressBalancesProps['onAdd']
  onChange: AddressBalancesProps['onChange']
  onRemove: AddressBalancesProps['onRemove']
}

export function AddressBalance({ id, isLast, onAdd, onChange, onRemove }: AddressBalanceProps) {
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ib-address-${htmlId}`,
    name: `ib-address-${htmlId}`,
    title: `Wallet Address`,
  })

  const amountState = useInputState({
    id: `ib-balance-${htmlId}`,
    name: `ib-balance-${htmlId}`,
    title: `Balance`,
    placeholder: '0',
  })

  useEffect(() => {
    onChange(id, {
      address: addressState.value,
      amount: amountState.value,
    })
  }, [addressState.value, amountState.value, id])

  return (
    <div className="grid relative grid-cols-[1fr_1fr_auto] space-x-2">
      <AddressInput {...addressState} />
      <NumberInput {...amountState} />
      <div className="flex justify-end items-end pb-2 w-8">
        <button
          className="flex justify-center items-center p-2 bg-plumbus-80 hover:bg-plumbus-60 rounded-full"
          onClick={() => (isLast ? onAdd() : onRemove(id))}
          type="button"
        >
          <Icon className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
