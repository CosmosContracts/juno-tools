import { isOfflineDirectSigner } from '@cosmjs/proto-signing'
import { getConfig } from 'config'
import { WalletContextType } from 'contexts/wallet'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { NETWORK } from './constants'

const getSignatureVerificationData = (
  wallet: WalletContextType,
  signedData: TxRaw
) => {
  return {
    address: wallet.address,
    chainId: getConfig(NETWORK).chainId,
    signature: Buffer.from(signedData.signatures[0]),
    bodyBytes: Buffer.from(signedData.bodyBytes),
    authInfoBytes: Buffer.from(signedData.authInfoBytes),
    accountNumber: wallet.accountNumber,
    sequence: wallet.sequence,
    isDirectSigner: isOfflineDirectSigner(wallet.getSigner()),
  }
}

export default getSignatureVerificationData
