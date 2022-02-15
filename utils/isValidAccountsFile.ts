import toast from 'react-hot-toast'

import { isValidAddress } from './isValidAddress'

export interface AccountProps {
  address: string
  amount: string
}

export const isValidAccountsFile = (file: Array<AccountProps>) => {
  const checks = file.map((account) => {
    // Check if address is valid bech32 address
    if (!isValidAddress(account.address)) {
      return { address: false }
    }
    // Check if address start with juno
    if (account.address.slice(0, 4) !== 'juno') {
      return { address: false }
    }
    // Check if amount is valid
    if (!Number(account.amount)) {
      return { amount: false }
    }
  })

  if (checks.filter((check) => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }
  if (checks.filter((check) => check?.amount === false).length > 0) {
    toast.error('Invalid amount in file')
    return false
  }

  return true
}
