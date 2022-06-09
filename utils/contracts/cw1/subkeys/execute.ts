import { coin } from '@cosmjs/proto-signing'
import { getConfig } from 'config'
import type { CW1SubkeysInstance, Permissions } from 'contracts/cw1/subkeys'
import { useCW1SubkeysContract } from 'contracts/cw1/subkeys'
import { NETWORK } from 'utils/constants'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'execute',
  'freeze',
  'update_admins',
  'increase_allowance',
  'decrease_allowance',
  'set_permissions',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'execute',
    name: 'Execute',
    description: `Execute Send, Delegate, Undelegate, Redelegate or Withdraw message`,
  },
  {
    id: 'freeze',
    name: 'Freeze',
    description: `Freeeze the admins of the contract`,
  },
  {
    id: 'update_admins',
    name: 'Update Admins',
    description: `Add or remove admins from the contract`,
  },
  {
    id: 'increase_allowance',
    name: 'Increase Allowance',
    description: `Increase the allowance of an address based on contracts balance`,
  },
  {
    id: 'decrease_allowance',
    name: 'Decrease Allowance',
    description: `Decrease the allowance of an address based on contracts balance`,
  },
  {
    id: 'set_permissions',
    name: 'Set Permissions',
    description: `Change executable message permissions of an address`,
  },
]

export type ExecutableType = typeof EXECUTABLE_TYPES[number]

export const EXECUTABLE_TYPES = ['send', 'delegate', 'undelegate', 'redelegate', 'withdraw'] as const

export interface ExecutableListItem {
  id: ExecutableType
  name: string
  description?: string
}

export const EXECUTABLE_LIST: ExecutableListItem[] = [
  {
    id: 'send',
    name: 'Send',
    description: `Send tokens to given address`,
  },
  {
    id: 'delegate',
    name: 'Delegate',
    description: `Delegate to a validator address`,
  },
  {
    id: 'undelegate',
    name: 'Undelegate',
    description: `Undelegate from a previously delegated validator address`,
  },
  {
    id: 'redelegate',
    name: 'Redelegate',
    description: `Redelegate from a delegated validator address to another validator address`,
  },
  {
    id: 'withdraw',
    name: 'Withdraw',
    description: `Set withdraw address for staking rewards`,
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
  messages?: CW1SubkeysInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'execute'>; recipient: string; amount: string; msgs: any }
  | { type: Select<'freeze'>; amount: string }
  | { type: Select<'update_admins'>; amount: string; admins: string[] }
  | { type: Select<'increase_allowance'>; recipient: string; amount: string }
  | { type: Select<'decrease_allowance'>; recipient: string; amount: string }
  | { type: Select<'set_permissions'>; recipient: string; permissions: Permissions }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'execute': {
      return messages.execute(txSigner, args.msgs)
    }
    case 'freeze': {
      return messages.freeze(txSigner)
    }
    case 'update_admins': {
      return messages.updateAdmins(txSigner, args.admins)
    }
    case 'increase_allowance': {
      return messages.increaseAllowance(
        txSigner,
        args.recipient,
        coin(args.amount.toString(), getConfig(NETWORK).feeToken),
      )
    }
    case 'decrease_allowance': {
      return messages.decreaseAllowance(
        txSigner,
        args.recipient,
        coin(args.amount.toString(), getConfig(NETWORK).feeToken),
      )
    }
    case 'set_permissions': {
      return messages.setPermissions(txSigner, args.recipient, args.permissions)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useCW1SubkeysContract()
  switch (args.type) {
    case 'execute': {
      const { contract, msgs } = args
      return messages()?.execute(contract, msgs)
    }
    case 'freeze': {
      const { contract } = args
      return messages()?.freeze(contract)
    }
    case 'update_admins': {
      const { contract, admins } = args
      return messages()?.updateAdmins(contract, admins)
    }
    case 'increase_allowance': {
      const { contract, recipient, amount } = args
      return messages()?.increaseAllowance(contract, recipient, amount.toString())
    }
    case 'decrease_allowance': {
      const { contract, recipient, amount } = args
      return messages()?.decreaseAllowance(contract, recipient, amount.toString())
    }
    case 'set_permissions': {
      const { contract, recipient, permissions } = args
      return messages()?.setPermissions(contract, recipient, permissions)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}

export const isEitherExecuteType = <T extends ExecutableType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
