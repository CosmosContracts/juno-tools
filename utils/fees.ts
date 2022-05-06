import { coins } from '@cosmjs/stargate'
import { getConfig } from 'config'

import { NETWORK } from './constants'

export const getExecuteFee = () => {
  const config = getConfig(NETWORK)
  return {
    amount: coins(500000, config.feeToken),
    gas: '1000000',
  }
}
