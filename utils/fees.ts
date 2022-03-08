import { coins } from '@cosmjs/stargate'
import { getConfig } from 'config'

import { NETWORK } from './constants'

const getExecuteFee = () => {
  const config = getConfig(NETWORK)
  return coins(50000, config.feeToken)
}

export default getExecuteFee
