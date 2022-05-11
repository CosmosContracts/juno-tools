import { useMemo, useState } from 'react'
import { uid } from 'utils/random'

import type { Balance } from './AddressBalances'

export function useAddressBalancesState() {
  const [record, setRecord] = useState<Record<string, Balance>>(() => ({
    [uid()]: { address: '', amount: '0' },
  }))

  const entries = useMemo(() => Object.entries(record), [record])
  const values = useMemo(() => Object.values(record), [record])

  function add(balance: Balance = { address: '', amount: '0' }) {
    setRecord((prev) => ({ ...prev, [uid()]: balance }))
  }

  function update(key: string, balance = record[key]) {
    setRecord((prev) => ({ ...prev, [key]: balance }))
  }

  function remove(key: string) {
    return setRecord((prev) => {
      const latest = { ...prev }
      delete latest[key]
      return latest
    })
  }

  return { entries, values, add, update, remove }
}
