import { coins } from '@cosmjs/stargate'
import { getConfig } from 'config'

import { NETWORK } from './constants'

const getExecuteFee = () => {
  const config = getConfig(NETWORK)
  return {
    amount: coins(500000, config.feeToken),
    gas: '1000000',
  }
}

export default getExecuteFee
