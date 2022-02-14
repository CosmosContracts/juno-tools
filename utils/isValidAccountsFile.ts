import toast from 'react-hot-toast'

import { isValidAddress } from './isValidAddress'

export interface AccountProps {
  address: string
  amount: number
}

export const isValidAccountsFile = (file: Array<AccountProps>) => {
  const checks = file.map(account => {
    // Check if fields are valid
    if(!account.hasOwnProperty('address') || !account.hasOwnProperty('amount')) {
      return { field: false }
    }
    // Check if address is valid bech32 address
    if(!isValidAddress(account.address)) {
      return { address: false }
    }
    // Check if address start with juno
    if(account.address.slice(0, 4) !== 'juno') {
      return { address: false }
    }
  })

  if(checks.filter(check => check?.field === false).length > 0) {
    toast.error('Invalid accounts file')
    return false
  }
  if(checks.filter(check => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }

  return true
}

