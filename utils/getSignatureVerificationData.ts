import { isOfflineDirectSigner } from '@cosmjs/proto-signing'
import { getConfig } from 'config'
import type { WalletContextType } from 'contexts/wallet'
import type { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'

import { NETWORK } from './constants'

export const getSignatureVerificationData = async (wallet: WalletContextType, signedData: TxRaw) => {
  const client = wallet.getClient()
  const account = await client.getAccount(wallet.address)
  return {
    address: wallet.address,
    chainId: getConfig(NETWORK).chainId,
    signature: Buffer.from(signedData.signatures[0]),
    bodyBytes: Buffer.from(signedData.bodyBytes),
    authInfoBytes: Buffer.from(signedData.authInfoBytes),
    accountNumber: wallet.accountNumber,
    sequence: account ? account.sequence - 1 : 0, // Minus 1 because we query after making transaction
    isDirectSigner: isOfflineDirectSigner(wallet.getSigner()),
  }
}
