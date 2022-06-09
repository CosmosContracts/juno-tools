import { useState } from 'react'
import type { ExecutableListItem, ExecuteListItem } from 'utils/contracts/cw1/subkeys/execute'

export const useExecuteComboboxState = () => {
  const [value, setValue] = useState<ExecuteListItem | null>(null)
  return { value, onChange: (item: ExecuteListItem) => setValue(item) }
}

export const useExecutableComboboxState = () => {
  const [value, setValue] = useState<ExecutableListItem | null>(null)
  return { value, onChange: (item: ExecutableListItem) => setValue(item) }
}
