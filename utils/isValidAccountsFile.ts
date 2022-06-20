import { toast } from 'react-hot-toast'

import { isValidAddress } from './isValidAddress'

export interface AccountProps {
  address: string
  amount: string
}

export const isValidAccountsFile = (file: AccountProps[]) => {
  const duplicateCheck = file
    .map((account) => account.address)
    .filter((address, index, self) => self.indexOf(address) !== index)

  const checks = file.map((account) => {
    // Check if address is valid bech32 address
    if (!isValidAddress(account.address)) {
      return { address: false }
    }
    // Check if address start with juno
    if (!account.address.startsWith('juno')) {
      return { address: false }
    }
    // Check if amount is valid
    if (!Number.isInteger(Number(account.amount)) || !(Number(account.amount) > 0)) {
      return { amount: false }
    }
    return null
  })

  if (checks.filter((check) => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }
  if (checks.filter((check) => check?.amount === false).length > 0) {
    toast.error('Invalid amount in file. Amount must be a positive integer.')
    return false
  }

  if (duplicateCheck.length > 0) {
    toast.error('The file contains duplicate addresses.')
    return false
  }

  return true
}
