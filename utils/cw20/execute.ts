export type ExecuteType = typeof EXECUTE_TYPES[number]

export const EXECUTE_TYPES = [
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

export const dispatchExecute = (props: DispatchExecuteProps) => {
  const { type } = props
  switch (type) {
    case 'burn': {
      return // TODO
    }
    case 'burn-from': {
      return // TODO
    }
    case 'increase-allowance': {
      return // TODO
    }
    case 'decrease-allowance': {
      return // TODO
    }
    case 'transfer': {
      return // TODO
    }
    case 'transfer-from': {
      return // TODO
    }
    case 'send': {
      return // TODO
    }
    case 'send-from': {
      return // TODO
    }
    case 'update-marketing': {
      return // TODO
    }
    case 'update-logo': {
      return // TODO
    }
    default: {
      throw new Error('unknown execute type')
    }
  }
}

export const isEitherType = <T extends ExecuteType>(type: unknown, arr: T[]): type is T => {
  return arr.some((val) => type === val)
}
