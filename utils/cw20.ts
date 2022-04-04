import { WalletContextType } from 'contexts/wallet'
import { CW20BaseInstance } from 'contracts/cw20/base'

export const QUERY_TYPES = [
  'balance',
  'allowance',
  'all_allowance',
  'all_accounts',
  'token_info',
  'minter',
  'marketing',
] as const

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_ENTRIES: {
  id: QueryType
  name: string
  description?: string
}[] = [
  { id: 'balance', name: 'Balance', description: 'View current balance' },
  {
    id: 'allowance',
    name: 'Allowance',
    description: 'View current all allowance',
  },
  {
    id: 'all_allowance',
    name: 'All Allowance',
    description: 'View all allowances',
  },
  {
    id: 'all_accounts',
    name: 'All Accounts',
    description: 'View all accounts',
  },
  {
    id: 'token_info',
    name: 'Token Info',
    description: 'View contract token info',
  },
  { id: 'minter', name: 'Minter', description: 'View contract minter' },
  {
    id: 'marketing',
    name: 'Marketing',
    description: 'View marketing information',
  },
]

export interface DispatchQueryProps {
  wallet: WalletContextType
  messages: CW20BaseInstance | undefined
  type: QueryType
}

export const dispatchQuery = (props: DispatchQueryProps) => {
  const { wallet, messages, type } = props
  switch (type) {
    case 'balance': {
      return messages?.balance(wallet.address)
    }
    case 'allowance': {
      return messages?.allowance(wallet.address, wallet.address)
    }
    case 'all_allowance': {
      return messages?.allAllowances(wallet.address)
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
