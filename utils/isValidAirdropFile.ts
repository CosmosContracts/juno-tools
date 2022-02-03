import { isValidAddress } from './isValidAddress'

interface AccountProps {
  address: string
  amount: number
}

interface AirdropFileProps {
  name: string
  accounts: [AccountProps]
  cw20TokenAddress: string
  start: number
  expiration: number
  totalAmount: number
}

const isValidAirdropFile = (file: AirdropFileProps) => {
  if (
    !file.hasOwnProperty('name') ||
    !file.hasOwnProperty('accounts') ||
    !file.hasOwnProperty('cw20TokenAddress') ||
    !file.hasOwnProperty('start') ||
    !file.hasOwnProperty('expiration') ||
    !file.hasOwnProperty('totalAmount')
  )
    return false
  if (!isValidAddress(file.cw20TokenAddress)) return false

  return true
}

export default isValidAirdropFile
