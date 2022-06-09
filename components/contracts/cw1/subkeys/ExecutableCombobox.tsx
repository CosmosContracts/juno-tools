import { Combobox, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { FormControl } from 'components/FormControl'
import { matchSorter } from 'match-sorter'
import { Fragment, useState } from 'react'
import { FaChevronDown } from 'react-icons/fa'
import type { ExecutableListItem } from 'utils/contracts/cw1/subkeys/execute'
import { EXECUTABLE_LIST } from 'utils/contracts/cw1/subkeys/execute'

export interface ExecutableComboboxProps {
  value: ExecutableListItem | null
  onChange: (item: ExecutableListItem) => void
}

export const ExecutableCombobox = ({ value, onChange }: ExecutableComboboxProps) => {
  const [search, setSearch] = useState('')

  const filtered =
    search === '' ? EXECUTABLE_LIST : matchSorter(EXECUTABLE_LIST, search, { keys: ['id', 'name', 'description'] })

  return (
    <Combobox
      as={FormControl}
      htmlId="message-type"
      labelAs={Combobox.Label}
      onChange={onChange}
      subtitle="Contract execute sub message type"
      title="Sub Message Type"
      value={value}
    >
      <div className="relative">
        <Combobox.Input
          className={clsx(
            'w-full bg-white/10 rounded border-2 border-white/20 form-input',
            'placeholder:text-white/50',
            'focus:ring focus:ring-plumbus-20',
          )}
          displayValue={(val?: ExecutableListItem) => val?.name ?? ''}
          id="message-type"
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Select sub message type"
        />

        <Combobox.Button
          className={clsx(
            'flex absolute inset-y-0 right-0 items-center p-4',
            'opacity-50 hover:opacity-100 active:opacity-100',
          )}
        >
          {({ open }) => <FaChevronDown aria-hidden="true" className={clsx('w-4 h-4', { 'rotate-180': open })} />}
        </Combobox.Button>

        <Transition afterLeave={() => setSearch('')} as={Fragment}>
          <Combobox.Options
            className={clsx(
              'overflow-auto absolute z-10 mt-2 w-full max-h-[30vh]',
              'bg-stone-800/80 rounded shadow-lg backdrop-blur-sm',
              'divide-y divide-stone-500/50',
            )}
          >
            {filtered.length < 1 && (
              <span className="flex flex-col justify-center items-center p-4 text-sm text-center text-white/50">
                Message type not found.
              </span>
            )}
            {filtered.map((entry) => (
              <Combobox.Option
                key={entry.id}
                className={({ active }) =>
                  clsx('flex relative flex-col py-2 px-4 space-y-1 cursor-pointer', { 'bg-plumbus-70': active })
                }
                value={entry}
              >
                <span className="font-bold">{entry.name}</span>
                <span className="max-w-md text-sm">{entry.description}</span>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  )
}
