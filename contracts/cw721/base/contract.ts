import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toBase64, toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
// import { isDeliverTxFailure } from '@cosmjs/stargate'
// import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
// import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { getExecuteFee } from 'utils/fees'

const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}

type Expiration = { at_height: number } | { at_time: string } | { never: object }

// interface ExecuteWithSignDataResponse {
//   signed: TxRaw
//   txHash: string
// }

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface CW721BaseInstance {
  readonly contractAddress: string

  // Queries
  ownerOf: (tokenId: string, includeExpired?: boolean) => Promise<any>
  approval: (tokenId: string, spender: string, includeExpired?: boolean) => Promise<any>
  approvals: (tokenId: string, includeExpired?: boolean) => Promise<any>
  allOperators: (owner: string, includeExpired?: boolean, startAfter?: string, limit?: number) => Promise<any>
  numTokens: () => Promise<any>
  contractInfo: () => Promise<any>
  nftInfo: (tokenId: string) => Promise<any>
  allNftInfo: (tokenId: string, includeExpired?: boolean) => Promise<any>
  tokens: (owner: string, startAfter?: string, limit?: number) => Promise<any>
  allTokens: (startAfter?: string, limit?: number) => Promise<any>
  minter: () => Promise<any>

  // Execute
  transferNft: (recipient: string, tokenId: string) => Promise<string>
  sendNft: (contract: string, tokenId: string, msg: Record<string, unknown>) => Promise<string>
  approve: (spender: string, tokenId: string, expires?: Expiration) => Promise<string>
  revoke: (spender: string, tokenId: string) => Promise<string>
  approveAll: (operator: string, expires?: Expiration) => Promise<string>
  revokeAll: (operator: string) => Promise<string>
  mint: (tokenId: string, owner: string, tokenUri?: string) => Promise<string>
  burn: (tokenId: string) => Promise<string>
}

export interface CW721BaseMessages {
  transferNft: (contractAddress: string, recipient: string, tokenId: string) => TransferNftMessage
  sendNft: (contractAddress: string, contract: string, tokenId: string, msg: Record<string, unknown>) => SendNFtMessage
  approve: (contractAddress: string, spender: string, tokenId: string, expires?: Expiration) => ApproveMessage
  revoke: (contractAddress: string, spender: string, tokenId: string) => RevokeMessage
  approveAll: (contractAddress: string, operator: string, expires?: Expiration) => ApproveAllMessage
  revokeAll: (contractAddress: string, operator: string) => RevokeAllMessage
  mint: (contractAddress: string, tokenId: string, owner: string, tokenUri?: string) => MintMessage
  burn: (contractAddress: string, tokenId: string) => BurnMessage
}

export interface TransferNftMessage {
  sender: string
  contract: string
  msg: {
    transfer_nft: {
      recipient: string
      token_id: string
    }
  }
  funds: Coin[]
}

export interface SendNFtMessage {
  sender: string
  contract: string
  msg: {
    send_nft: {
      contract: string
      token_id: string
      msg: Record<string, unknown>
    }
  }
  funds: Coin[]
}

export interface ApproveMessage {
  sender: string
  contract: string
  msg: {
    approve: {
      spender: string
      token_id: string
      expires?: Expiration
    }
  }
  funds: Coin[]
}

export interface RevokeMessage {
  sender: string
  contract: string
  msg: {
    revoke: {
      spender: string
      token_id: string
    }
  }
  funds: Coin[]
}

export interface ApproveAllMessage {
  sender: string
  contract: string
  msg: {
    approve_all: {
      operator: string
      expires?: Expiration
    }
  }
  funds: Coin[]
}

export interface RevokeAllMessage {
  sender: string
  contract: string
  msg: {
    revoke_all: {
      operator: string
    }
  }
  funds: Coin[]
}

export interface MintMessage {
  sender: string
  contract: string
  msg: {
    mint: {
      token_id: string
      owner: string
      token_uri?: string
    }
  }
  funds: Coin[]
}

export interface BurnMessage {
  sender: string
  contract: string
  msg: {
    burn: {
      token_id: string
    }
  }
  funds: Coin[]
}

export interface CW721BaseContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW721BaseInstance

  messages: () => CW721BaseMessages
}

export const CW721Base = (client: SigningCosmWasmClient, txSigner: string): CW721BaseContract => {
  const fee = getExecuteFee()

  const use = (contractAddress: string): CW721BaseInstance => {
    const ownerOf = async (tokenId: string, includeExpired?: boolean) => {
      return client.queryContractSmart(contractAddress, {
        owner_of: { token_id: tokenId, include_expired: includeExpired },
      })
    }

    const approval = async (tokenId: string, spender: string, includeExpired?: boolean) => {
      return client.queryContractSmart(contractAddress, {
        approval: { token_id: tokenId, spender, include_expired: includeExpired },
      })
    }

    const approvals = async (tokenId: string, includeExpired?: boolean) => {
      return client.queryContractSmart(contractAddress, {
        approvals: { token_id: tokenId, include_expired: includeExpired },
      })
    }

    const allOperators = async (owner: string, includeExpired?: boolean, startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        all_operators: { owner, include_expired: includeExpired, start_after: startAfter, limit },
      })
    }

    const numTokens = async () => {
      return client.queryContractSmart(contractAddress, {
        num_tokens: {},
      })
    }

    const contractInfo = async () => {
      return client.queryContractSmart(contractAddress, {
        contract_info: {},
      })
    }

    const nftInfo = async (tokenId: string) => {
      return client.queryContractSmart(contractAddress, {
        nft_info: { token_id: tokenId },
      })
    }

    const allNftInfo = async (tokenId: string, includeExpired?: boolean) => {
      return client.queryContractSmart(contractAddress, {
        all_nft_info: { token_id: tokenId, include_expired: includeExpired },
      })
    }

    const tokens = async (owner: string, startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        tokens: { owner, start_after: startAfter, limit },
      })
    }

    const allTokens = async (startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        all_tokens: { start_after: startAfter, limit },
      })
    }

    const minter = async () => {
      return client.queryContractSmart(contractAddress, {
        minter: {},
      })
    }

    const transferNft = async (recipient: string, tokenId: string): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { transfer_nft: { recipient, token_id: tokenId } },
        fee,
      )
      return result.transactionHash
    }

    const sendNft = async (contract: string, tokenId: string, msg: Record<string, unknown>): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { send_nft: { contract, token_id: tokenId, msg: jsonToBinary(msg) } },
        fee,
      )
      return result.transactionHash
    }

    const approve = async (spender: string, tokenId: string, expires?: Expiration): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { approve: { spender, token_id: tokenId, expires } },
        fee,
      )
      return result.transactionHash
    }

    const revoke = async (spender: string, tokenId: string): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { revoke: { spender, token_id: tokenId } }, fee)
      return result.transactionHash
    }

    const approveAll = async (operator: string, expires?: Expiration): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { approve_all: { operator, expires } }, fee)
      return result.transactionHash
    }

    const revokeAll = async (operator: string): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { revoke_all: { operator } }, fee)
      return result.transactionHash
    }

    const mint = async (tokenId: string, owner: string, tokenUri?: string): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { mint: { token_id: tokenId, owner, token_uri: tokenUri } },
        fee,
      )
      return result.transactionHash
    }

    const burn = async (tokenId: string): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { burn: { token_id: tokenId } }, fee)
      return result.transactionHash
    }

    return {
      contractAddress,
      ownerOf,
      approval,
      approvals,
      allOperators,
      numTokens,
      contractInfo,
      nftInfo,
      allNftInfo,
      tokens,
      allTokens,
      minter,
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      burn,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, 'auto', {
      memo: '',
      admin,
    })

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = () => {
    const transferNft = (contractAddress: string, recipient: string, tokenId: string): TransferNftMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          transfer_nft: { recipient, token_id: tokenId },
        },
        funds: [],
      }
    }

    const sendNft = (
      contractAddress: string,
      contract: string,
      tokenId: string,
      msg: Record<string, unknown>,
    ): SendNFtMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          send_nft: { contract, token_id: tokenId, msg },
        },
        funds: [],
      }
    }

    const approve = (
      contractAddress: string,
      spender: string,
      tokenId: string,
      expires?: Expiration,
    ): ApproveMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          approve: { spender, token_id: tokenId, expires },
        },
        funds: [],
      }
    }

    const revoke = (contractAddress: string, spender: string, tokenId: string): RevokeMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          revoke: { spender, token_id: tokenId },
        },
        funds: [],
      }
    }

    const approveAll = (contractAddress: string, operator: string, expires?: Expiration): ApproveAllMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          approve_all: { operator, expires },
        },
        funds: [],
      }
    }

    const revokeAll = (contractAddress: string, operator: string): RevokeAllMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          revoke_all: { operator },
        },
        funds: [],
      }
    }

    const mint = (contractAddress: string, tokenId: string, owner: string, tokenUri?: string): MintMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          mint: { token_id: tokenId, owner, token_uri: tokenUri },
        },
        funds: [],
      }
    }

    const burn = (contractAddress: string, tokenId: string): BurnMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          burn: { token_id: tokenId },
        },
        funds: [],
      }
    }

    return {
      transferNft,
      sendNft,
      approve,
      revoke,
      approveAll,
      revokeAll,
      mint,
      burn,
    }
  }

  return { instantiate, use, messages }
}
