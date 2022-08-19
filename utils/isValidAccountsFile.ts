import { toast } from 'react-hot-toast'

import { AIRDROP_ACCOUNT_LIMIT } from './constants'
import { isValidAddress } from './isValidAddress'

export interface AccountProps {
  address: string
  amount: string
}

export const isValidAccountsFile = (file: AccountProps[]) => {
  // TODO: Think about duplicate values again
  // const duplicateCheck = file
  //   .map((account) => account.address)
  //   .filter((address, index, self) => self.indexOf(address) !== index)

  if (file.length > AIRDROP_ACCOUNT_LIMIT) {
    throw new Error(`Accounts file must have less than ${AIRDROP_ACCOUNT_LIMIT} accounts`)
  }

  const checks = file.map((account) => {
    // Check if address is valid bech32 address
    if (!isValidAddress(account.address)) {
      return { address: false }
    }
    // Check if address start with juno
    if (!account.address.startsWith('juno') && !account.address.startsWith('terra')) {
      return { address: false }
    }
    // Check if amount is valid
    if (!Number.isInteger(Number(account.amount)) || !(Number(account.amount) > 0)) {
      return { amount: false }
    }
    return null
  })

  const isJunoAddresses = file.every((account) => account.address.startsWith('juno'))
  const isTerraAddresses = file.every((account) => account.address.startsWith('terra'))
  if (!isJunoAddresses && !isTerraAddresses) {
    toast.error('All accounts must be on the same network')
    return false
  }

  if (checks.filter((check) => check?.address === false).length > 0) {
    toast.error('Invalid address in file')
    return false
  }
  if (checks.filter((check) => check?.amount === false).length > 0) {
    toast.error('Invalid amount in file. Amount must be a positive integer.')
    return false
  }

  // if (duplicateCheck.length > 0) {
  //   toast.error('The file contains duplicate addresses.')
  //   return false
  // }

  return true
}

export const isTerraAccounts = (file: AccountProps[]) => {
  return file.every((account) => account.address.startsWith('terra'))
}
