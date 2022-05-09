import type { CW20BaseInstance } from 'contracts/cw20/base'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'balance',
  'allowance',
  'all_allowance',
  'all_accounts',
  'token_info',
  'minter',
  'marketing',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'balance', name: 'Balance', description: 'View current balance' },
  { id: 'allowance', name: 'Allowance', description: 'View current all allowance' },
  { id: 'all_allowance', name: 'All Allowance', description: 'View all allowances' },
  { id: 'all_accounts', name: 'All Accounts', description: 'View all accounts' },
  { id: 'token_info', name: 'Token Info', description: 'View contract token info' },
  { id: 'minter', name: 'Minter', description: 'View contract minter' },
  { id: 'marketing', name: 'Marketing', description: 'View marketing information' },
]

export interface DispatchQueryProps {
  ownerAddress: string
  spenderAddress: string
  messages: CW20BaseInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { ownerAddress, spenderAddress, messages, type } = props
  switch (type) {
    case 'balance': {
      return messages?.balance(ownerAddress)
    }
    case 'allowance': {
      return messages?.allowance(ownerAddress, spenderAddress)
    }
    case 'all_allowance': {
      return messages?.allAllowances(ownerAddress)
    }
    case 'all_accounts': {
      return messages?.allAccounts()
    }
    case 'token_info': {
      return messages?.tokenInfo()
    }
    case 'minter': {
      return messages?.minter()
    }
    case 'marketing': {
      return messages?.marketingInfo()
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
