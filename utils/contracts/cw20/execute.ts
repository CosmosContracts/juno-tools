import type { CW20BaseInstance } from 'contracts/cw20/base'
import { useCW20BaseContract } from 'contracts/cw20/base'

export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
  'mint',
  'burn',
  'burn-from',
  'increase-allowance',
  'decrease-allowance',
  'transfer',
  'transfer-from',
  'send',
  'send-from',
  'update-marketing',
  'update-logo',
] as const

export interface ExecuteListItem {
  id: ExecuteType
  name: string
  description?: string
}

export const EXECUTE_LIST: ExecuteListItem[] = [
  {
    id: 'mint',
    name: 'Mint',
    description: `Mint new tokens for a given address`,
  },
  {
    id: 'burn',
    name: 'Burn',
    description: `Remove some amount of tokens from the balance of an address and reduce total token supply by the same amount`,
  },
  {
    id: 'burn-from',
    name: 'Burn From',
    description: `Make use of an allowance and remove some amount of tokens from the balance of owner's address`,
  },
  {
    id: 'increase-allowance',
    name: 'Increase Allowance',
    description: `Increase the allowance of an address based on your balance. This is basically delegating your balance to another address`,
  },
  {
    id: 'decrease-allowance',
    name: 'Decrease Allowance',
    description: `Decrease the allowance of an address based on your balance`,
  },
  {
    id: 'transfer',
    name: 'Transfer',
    description: `Move some amount of tokens from one address to another address`,
  },
  {
    id: 'transfer-from',
    name: 'Transfer From',
    description: `Make use of an allowance and move some amount of tokens from one address to another address`,
  },
  {
    id: 'send',
    name: 'Send',
    description: `Move some amount of tokens from one address to another address and execute a message in the end.`,
  },
  {
    id: 'send-from',
    name: 'Send From',
    description: `Make use of an allowance and move some amount of tokens from one address to another address and execute a message in the end`,
  },
  {
    id: 'update-marketing',
    name: 'Update Marketing',
    description: `Update marketing info object`,
  },
  {
    id: 'update-logo',
    name: 'Update Logo',
    description: `Update token logo URL`,
  },
]

export interface DispatchExecuteProps {
  type: ExecuteType
  [k: string]: unknown
}

type Select<T extends ExecuteType> = T

/** @see {@link CW20BaseInstance} */
export type DispatchExecuteArgs = {
  contract: string
  messages?: CW20BaseInstance
  txSigner: string
} & (
  | { type: undefined }
  | { type: Select<'mint'>; recipient: string; amount: string }
  | { type: Select<'burn'>; amount: string }
  | { type: Select<'burn-from'>; owner: string; amount: string }
  | { type: Select<'increase-allowance'>; recipient: string; amount: string }
  | { type: Select<'decrease-allowance'>; recipient: string; amount: string }
  | { type: Select<'transfer'>; recipient: string; amount: string }
  | { type: Select<'transfer-from'>; owner: string; recipient: string; amount: string }
  | { type: Select<'send'>; recipient: string; amount: string; msg: any }
  | { type: Select<'send-from'>; owner: string; recipient: string; amount: string; msg: any }
  | { type: Select<'update-marketing'>; project: string; description: string; marketing: string }
  | { type: Select<'update-logo'>; logo: { url: string } }
)

export const dispatchExecute = async (args: DispatchExecuteArgs) => {
  const { messages, txSigner } = args
  if (!messages) {
    throw new Error('cannot dispatch execute, messages is not defined')
  }
  switch (args.type) {
    case 'mint': {
      const result = await messages.mint(args.recipient, args.amount.toString())
      return result.txHash
    }
    case 'burn': {
      return messages.burn(txSigner, args.amount.toString())
    }
    case 'burn-from': {
      return messages.burnFrom(txSigner, args.owner, args.amount.toString())
    }
    case 'increase-allowance': {
      return messages.increaseAllowance(txSigner, args.recipient, args.amount.toString())
    }
    case 'decrease-allowance': {
      return messages.decreaseAllowance(txSigner, args.recipient, args.amount.toString())
    }
    case 'transfer': {
      const result = await messages.transfer(args.recipient, args.amount.toString())
      return result.txHash
    }
    case 'transfer-from': {
      return messages.transferFrom(txSigner, args.owner, args.recipient, args.amount.toString())
    }
    case 'send': {
      return messages.send(txSigner, args.recipient, args.amount.toString(), args.msg)
    }
    case 'send-from': {
      return messages.sendFrom(txSigner, args.owner, args.recipient, args.amount.toString(), args.msg)
    }
    case 'update-marketing': {
      return messages.updateMarketing(txSigner, args.project, args.description, args.marketing)
    }
    case 'update-logo': {
      return messages.uploadLogo(txSigner, args.logo)
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const previewExecutePayload = (args: DispatchExecuteArgs) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { messages } = useCW20BaseContract()
  switch (args.type) {
    case 'mint': {
      const { contract, amount, recipient } = args
      return messages()?.mint(contract, recipient, amount.toString())
    }
    case 'burn': {
      const { contract, amount } = args
      return messages()?.burn(contract, amount.toString())
    }
    case 'burn-from': {
      const { contract, owner, amount } = args
      return messages()?.burnFrom(contract, owner, amount.toString())
    }
    case 'increase-allowance': {
      const { contract, recipient, amount } = args
      return messages()?.increaseAllowance(contract, recipient, amount.toString())
    }
    case 'decrease-allowance': {
      const { contract, recipient, amount } = args
      return messages()?.decreaseAllowance(contract, recipient, amount.toString())
    }
    case 'transfer': {
      const { contract, recipient, amount } = args
      return messages()?.transfer(contract, recipient, amount.toString())
    }
    case 'transfer-from': {
      const { contract, recipient, amount, owner } = args
      return messages()?.transferFrom(contract, owner, recipient, amount.toString())
    }
    case 'send': {
      const { contract, recipient, amount, msg } = args
      return messages()?.send(contract, recipient, amount.toString(), msg)
    }
    case 'send-from': {
      const { contract, amount, msg, owner, recipient } = args
      return messages()?.sendFrom(contract, owner, recipient, amount.toString(), msg)
    }
    case 'update-marketing': {
      const { contract, project, description, marketing } = args
      return messages()?.updateMarketing(contract, project, description, marketing)
    }
    case 'update-logo': {
      const { contract, logo } = args
      return messages()?.uploadLogo(contract, logo.url)
    }
    default: {
      return {}
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
