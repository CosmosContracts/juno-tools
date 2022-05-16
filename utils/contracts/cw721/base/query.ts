import type { CW721BaseInstance } from 'contracts/cw721/base'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'owner_of',
  'approval',
  'approvals',
  'all_operators',
  'num_tokens',
  'contract_info',
  'nft_info',
  'all_nft_info',
  'tokens',
  'all_tokens',
  'minter',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'owner_of', name: 'Owner Of', description: 'View current owner of given token' },
  { id: 'approval', name: 'Approval', description: 'View address that has access to given token' },
  { id: 'approvals', name: 'Approvals', description: 'View all approvals of a given token' },
  {
    id: 'all_operators',
    name: 'All Operators',
    description: "List all the operators that has access all of the owner's tokens",
  },
  { id: 'num_tokens', name: 'Number of Tokens', description: 'View total number of tokens minted' },
  { id: 'contract_info', name: 'Contract Info', description: 'View top-level metadata of contract' },
  { id: 'nft_info', name: 'NFT Info', description: 'View metadata of a given token' },
  { id: 'all_nft_info', name: 'All NFT Info', description: 'View metadata and owner info of a given token' },
  { id: 'tokens', name: 'Tokens', description: 'View all the tokens owned by given address' },
  { id: 'all_tokens', name: 'All Tokens', description: 'List all the tokens controlled by the contract' },
  { id: 'minter', name: 'Minter', description: 'View current minter of the contract' },
]

export interface DispatchQueryProps {
  ownerAddress: string
  tokenId: string
  messages: CW721BaseInstance | undefined
  type: QueryType
}

export const dispatchQuery = async (props: DispatchQueryProps) => {
  const { ownerAddress, tokenId, messages, type } = props
  switch (type) {
    case 'owner_of': {
      return messages?.ownerOf(tokenId)
    }
    case 'approval': {
      return messages?.approval(tokenId, ownerAddress)
    }
    case 'approvals': {
      return messages?.approvals(tokenId)
    }
    case 'all_operators': {
      return messages?.allOperators(ownerAddress)
    }
    case 'num_tokens': {
      return messages?.numTokens()
    }
    case 'contract_info': {
      return messages?.contractInfo()
    }
    case 'nft_info': {
      return messages?.nftInfo(tokenId)
    }
    case 'all_nft_info': {
      return messages?.allNftInfo(tokenId)
    }
    case 'tokens': {
      return messages?.tokens(ownerAddress)
    }
    case 'all_tokens': {
      return messages?.allTokens()
    }
    case 'minter': {
      return messages?.minter()
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
