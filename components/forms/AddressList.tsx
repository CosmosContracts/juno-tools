import { FormControl } from 'components/FormControl'
import { AddressInput } from 'components/forms/FormInput'
import { useEffect, useId, useMemo } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'

import { useInputState } from './FormInput.hooks'

export interface Address {
  address: string
}

export interface AddressListProps {
  title: string
  subtitle?: string
  isRequired?: boolean
  entries: [string, Address][]
  onAdd: () => void
  onChange: (key: string, address: Address) => void
  onRemove: (key: string) => void
}

export function AddressList(props: AddressListProps) {
  const { title, subtitle, isRequired, entries, onAdd, onChange, onRemove } = props
  return (
    <FormControl isRequired={isRequired} subtitle={subtitle} title={title}>
      {entries.map(([id], i) => (
        <Address
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

export interface AddressProps {
  id: string
  isLast: boolean
  onAdd: AddressListProps['onAdd']
  onChange: AddressListProps['onChange']
  onRemove: AddressListProps['onRemove']
}

export function Address({ id, isLast, onAdd, onChange, onRemove }: AddressProps) {
  const Icon = useMemo(() => (isLast ? FaPlus : FaMinus), [isLast])

  const htmlId = useId()

  const addressState = useInputState({
    id: `ib-address-${htmlId}`,
    name: `ib-address-${htmlId}`,
    title: ``,
  })

  useEffect(() => {
    onChange(id, {
      address: addressState.value,
    })
  }, [addressState.value, id])

  return (
    <div className="grid relative grid-cols-[1fr_auto] space-x-2">
      <AddressInput {...addressState} />
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
