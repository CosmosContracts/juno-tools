import type { ChangeEvent } from 'react'
import { useState } from 'react'

export interface UseAddressInputStateProps {
  id: string
  name: string
  title: string
  subtitle?: string
}

export const useAddressInputState = (args: UseAddressInputStateProps) => {
  const [value, setValue] = useState<string>('')
  return {
    value,
    onChange: (obj: string | ChangeEvent<HTMLInputElement>) => {
      setValue(typeof obj === 'string' ? obj : obj.target.value)
    },
    ...args,
  }
}
