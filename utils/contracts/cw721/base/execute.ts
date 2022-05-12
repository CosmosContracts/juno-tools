import type { CW721BaseInstance } from 'contracts/cw721/base'
import { useCW721BaseContract } from 'contracts/cw721/base'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'transfer_nft',
  'send_nft',
  'approve',
  'revoke',
  'approve_all',
  'revoke_all',
  'mint',
  'burn',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'transfer_nft',
    name: 'Transfer NFT',
    description: `Transfer a token to an address`,
  },
  {
    id: 'send_nft',
    name: 'Send NFT',
    description: `Send a token to a contract and execute a message afterwards`,
  },
  {
    id: 'approve',
    name: 'Approve',
    description: `Allow an operator to transfer/send a given token from the owner's account`,
  },
  {
    id: 'revoke',
    name: 'Revoke',
    description: `Remove permissions of an operator from the owner's account`,
  },
  {
    id: 'approve_all',
    name: 'Approve All',
    description: `Allow an operator to transfer/send all tokens from owner's account`,
  },
  {
    id: 'revoke_all',
    name: 'Revoke All',
    description: `Remove permissions of an operator from the owner's account`,
  },
  {
    id: 'mint',
    name: 'Mint',
    description: `Mint a new token to owner's account`,
  },
  {
    id: 'burn',
    name: 'Burn',
    description: `Burn a token transaction sender has access to`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link CW1SubkeysInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: CW721BaseInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'transfer_nft'>; recipient: string; tokenId: string }
  | { type: Select<'send_nft'>; recipient: string; tokenId: string; msg: Record<string, unknown> }
  | { type: Select<'approve'>; recipient: string; tokenId: string }
  | { type: Select<'revoke'>; recipient: string; tokenId: string }
  | { type: Select<'approve_all'>; recipient: string }
  | { type: Select<'revoke_all'>; recipient: string }
  | { type: Select<'mint'>; recipient: string; tokenId: string }
  | { type: Select<'burn'>; tokenId: string }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'transfer_nft': {
      return messages.transferNft(args.recipient, args.tokenId)
    }
    case 'send_nft': {
      return messages.sendNft(args.contract, args.tokenId, args.msg)
    }
    case 'approve': {
      return messages.approve(args.recipient, args.tokenId)
    }
    case 'revoke': {
      return messages.revoke(args.recipient, args.tokenId)
    }
    case 'approve_all': {
      return messages.approveAll(args.recipient)
    }
    case 'revoke_all': {
      return messages.revokeAll(args.recipient)
    }
    case 'mint': {
      return messages.mint(args.tokenId, args.recipient)
    }
    case 'burn': {
      return messages.burn(args.tokenId)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useCW721BaseContract()
  switch (args.type) {
    case 'transfer_nft': {
      const { contract, recipient, tokenId } = args
      return messages()?.transferNft(contract, recipient, tokenId)
    }
    case 'send_nft': {
      const { contract, recipient, tokenId, msg } = args
      return messages()?.sendNft(contract, recipient, tokenId, msg)
    }
    case 'approve': {
      const { contract, recipient, tokenId } = args
      return messages()?.approve(contract, recipient, tokenId)
    }
    case 'revoke': {
      const { contract, recipient, tokenId } = args
      return messages()?.revoke(contract, recipient, tokenId)
    }
    case 'approve_all': {
      const { contract, recipient } = args
      return messages()?.approveAll(contract, recipient)
    }
    case 'revoke_all': {
      const { contract, recipient } = args
      return messages()?.revokeAll(contract, recipient)
    }
    case 'mint': {
      const { contract, recipient, tokenId } = args
      return messages()?.mint(contract, tokenId, recipient)
    }
    case 'burn': {
      const { contract, tokenId } = args
      return messages()?.burn(contract, tokenId)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
