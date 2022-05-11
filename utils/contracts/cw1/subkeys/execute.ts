import { coin } from '@cosmjs/proto-signing'
import { getConfig } from 'config'
import type { CW1SubkeysInstance } from 'contracts/cw1/subkeys'
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
  | { type: Select<'execute'>; recipient: string; amount: string }
  | { type: Select<'freeze'>; amount: string }
  | { type: Select<'update_admins'>; owner: string; amount: string }
  | { type: Select<'increase_allowance'>; recipient: string; amount: string }
  | { type: Select<'decrease_allowance'>; recipient: string; amount: string }
  | { type: Select<'set_permissions'>; recipient: string; amount: string }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'execute': {
      return messages.execute(txSigner, {})
    }
    case 'freeze': {
      return messages.freeze(txSigner)
    }
    case 'update_admins': {
      return messages.updateAdmins(txSigner, [])
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
      return messages.setPermissions(txSigner, args.recipient, {})
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

// export const previewExecutePayload = (args: DispatchExecuteArgs) => {
//   // eslint-disable-next-line react-hooks/rules-of-hooks
//   const { messages } = useCW20BaseContract()
//   switch (args.type) {
//     case 'mint': {
//       const { contract, amount, recipient } = args
//       return messages()?.mint(contract, recipient, amount.toString())
//     }
//     case 'burn': {
//       const { contract, amount } = args
//       return messages()?.burn(contract, amount.toString())
//     }
//     case 'burn-from': {
//       const { contract, owner, amount } = args
//       return messages()?.burnFrom(contract, owner, amount.toString())
//     }
//     case 'increase-allowance': {
//       const { contract, recipient, amount } = args
//       return messages()?.increaseAllowance(contract, recipient, amount.toString())
//     }
//     case 'decrease-allowance': {
//       const { contract, recipient, amount } = args
//       return messages()?.decreaseAllowance(contract, recipient, amount.toString())
//     }
//     case 'transfer': {
//       const { contract, recipient, amount } = args
//       return messages()?.transfer(contract, recipient, amount.toString())
//     }
//     case 'transfer-from': {
//       const { contract, recipient, amount, owner } = args
//       return messages()?.transferFrom(contract, owner, recipient, amount.toString())
//     }
//     case 'send': {
//       const { contract, amount, msg } = args
//       return messages()?.send(contract, contract, amount.toString(), msg)
//     }
//     case 'send-from': {
//       const { contract, amount, msg, owner, recipient } = args
//       return messages()?.sendFrom(contract, owner, recipient, amount.toString(), msg)
//     }
//     case 'update-marketing': {
//       const { contract, project, description, marketing } = args
//       return messages()?.updateMarketing(contract, project, description, marketing)
//     }
//     case 'update-logo': {
//       const { contract, logo } = args
//       return messages()?.uploadLogo(contract, logo.url)
//     }
//     default: {
//       return {}
//     }
//   }
// }

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
