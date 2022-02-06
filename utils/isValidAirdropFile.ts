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
  startType: string
  expiration: number
  expirationType: string
  totalAmount: number
}

const isValidAirdropFile = (file: AirdropFileProps) => {
  if (
    !file.hasOwnProperty('name') ||
    !file.hasOwnProperty('accounts') ||
    !file.hasOwnProperty('cw20TokenAddress') ||
    !file.hasOwnProperty('start') ||
    !file.hasOwnProperty('startType') ||
    !file.hasOwnProperty('expiration') ||
    !file.hasOwnProperty('expirationType') ||
    !file.hasOwnProperty('totalAmount')
  )
    return false
  if (
    file.startType !== 'timestamp' &&
    file.startType !== 'height' &&
    file.startType !== null
  )
    return false
  if (
    file.expirationType !== 'timestamp' &&
    file.expirationType !== 'height' &&
    file.expirationType !== null
  )
    return false
  if (!isValidAddress(file.cw20TokenAddress)) return false

  return true
}

export default isValidAirdropFile
