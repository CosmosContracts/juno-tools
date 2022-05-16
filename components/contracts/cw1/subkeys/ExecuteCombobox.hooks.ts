import { useState } from 'react'
import type { ExecuteListItem } from 'utils/contracts/cw1/subkeys/execute'

export const useExecuteComboboxState = () => {
  const [value, setValue] = useState<ExecuteListItem | null>(null)
  return { value, onChange: (item: ExecuteListItem) => setValue(item) }
}
