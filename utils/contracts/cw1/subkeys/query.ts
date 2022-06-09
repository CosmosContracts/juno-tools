import type { CosmosMsg, CW1SubkeysInstance } from 'contracts/cw1/subkeys'

export type QueryType = typeof QUERY_TYPES[number]

export const QUERY_TYPES = [
  'admins',
  'allowance',
  'all_allowance',
  'permissions',
  'all_permissions',
  'can_execute',
  'send',
  'delegate',
  'undelegate',
  'redelegate',
  'withdraw',
] as const

export interface QueryListItem {
  id: QueryType
  name: string
  description?: string
}

export const QUERY_LIST: QueryListItem[] = [
  { id: 'admins', name: 'Admins', description: 'View current admins' },
  { id: 'allowance', name: 'Allowance', description: 'View current allowance for an address' },
  { id: 'all_allowance', name: 'All Allowances', description: 'View all allowances' },
  { id: 'permissions', name: 'Permissions', description: 'View all permissions for an address' },
  { id: 'all_permissions', name: 'All Permissions', description: 'View all permissions' },
  { id: 'can_execute', name: 'Can Execute', description: 'Check if an address is able to execute given message' },
]

export const QUERY_EXECUTE_LIST: QueryListItem[] = [
  { id: 'send', name: 'Send', description: 'View current admins' },
  { id: 'delegate', name: 'Delegate', description: 'View current allowance for an address' },
  { id: 'undelegate', name: 'Undelegate', description: 'View all allowances' },
  { id: 'redelegate', name: 'Redelegate', description: 'View all permissions for an address' },
  { id: 'withdraw', name: 'Withdraw', description: 'View all permissions' },
]

export interface DispatchQueryProps {
  ownerAddress: string
  canExecuteMessage: CosmosMsg
  messages: CW1SubkeysInstance | undefined
  type: QueryType
}

export const dispatchQuery = async (props: DispatchQueryProps) => {
  const { ownerAddress, messages, type, canExecuteMessage } = props
  switch (type) {
    case 'admins': {
      const data = await messages?.admins()
      return { admins: data?.admins, mutable: data?.mutable }
    }
    case 'allowance': {
      return messages?.allowance(ownerAddress)
    }
    case 'all_allowance': {
      return messages?.allAllowances()
    }
    case 'permissions': {
      return messages?.permissions(ownerAddress)
    }
    case 'all_permissions': {
      return messages?.allPermissions()
    }
    case 'can_execute': {
      return messages?.canExecute(ownerAddress, canExecuteMessage)
    }
    default: {
      throw new Error('unknown query type')
    }
  }
}
