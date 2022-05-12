import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import type { Coin } from '@cosmjs/proto-signing'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export type Expiration = { at_height: number } | { at_time: string } | { never: object }

export interface CanExecuteResponse {
  readonly can_execute: boolean
}

export interface Permissions {
  readonly delegate: boolean
  readonly undelegate: boolean
  readonly redelegate: boolean
  readonly withdraw: boolean
}

export interface PermissionsInfo {
  readonly spender: string
  readonly permissions: Permissions
}

interface AllPermissionsResponse {
  readonly permissions: readonly PermissionsInfo[]
}

export interface AllowanceInfo {
  readonly balance: readonly Coin[]
  readonly expires: Expiration
  readonly spender?: string
}

export interface AllAllowancesResponse {
  readonly allowances: readonly AllowanceInfo[]
}

interface AdminListResponse {
  readonly admins: readonly string[]
  readonly mutable: boolean
}

export type CosmosMsg = SendMsg | DelegateMsg | UndelegateMsg | RedelegateMsg | WithdrawMsg

export interface SendMsg {
  readonly bank: {
    readonly send: {
      readonly from_address: string
      readonly to_address: string
      readonly amount: readonly Coin[]
    }
  }
}

export interface DelegateMsg {
  readonly staking: {
    readonly delegate: {
      readonly validator: string
      readonly amount: Coin
    }
  }
}

export interface UndelegateMsg {
  readonly staking: {
    readonly undelegate: {
      readonly validator: string
      readonly amount: Coin
    }
  }
}

export interface RedelegateMsg {
  readonly staking: {
    readonly redelegate: {
      readonly src_validator: string
      readonly dst_validator: string
      readonly amount: Coin
    }
  }
}

export interface WithdrawMsg {
  readonly staking: {
    readonly withdraw: {
      readonly validator: string
      readonly recipient?: string
    }
  }
}

export interface CW1SubkeysInstance {
  readonly contractAddress: string

  // queries
  admins: () => Promise<AdminListResponse>

  allowance: (address?: string) => Promise<AllowanceInfo>

  allAllowances: (startAfter?: string, limit?: number) => Promise<AllAllowancesResponse>

  permissions: (address?: string) => Promise<PermissionsInfo>

  allPermissions: (startAfter?: string, limit?: number) => Promise<AllPermissionsResponse>

  canExecute: (sender: string, msg: CosmosMsg) => Promise<CanExecuteResponse>

  // actions
  execute: (senderAddress: string, msgs: readonly CosmosMsg[]) => Promise<string>

  freeze: (senderAddress: string) => Promise<string>

  updateAdmins: (senderAddress: string, admins: readonly string[]) => Promise<string>

  increaseAllowance: (senderAddress: string, recipient: string, amount: Coin, expires?: Expiration) => Promise<string>

  decreaseAllowance: (senderAddress: string, recipient: string, amount: Coin, expires?: Expiration) => Promise<string>

  setPermissions: (senderAddress: string, recipient: string, permissions: Permissions) => Promise<string>
}

export interface CW1SubkeysMessages {
  execute: (contractAddress: string, msgs: CosmosMsg[]) => any
  freeze: (contractAddress: string) => any
  updateAdmins: (contractAddress: string, admins: string[]) => any
  increaseAllowance: (cw20TokenAddress: string, recipient: string, amount: string) => IncreaseAllowanceMessage
  decreaseAllowance: (cw20TokenAddress: string, recipient: string, amount: string) => DecreaseAllowanceMessage
  setPermissions: (cw20TokenAddress: string, recipient: string, permissions: Permissions) => any
}

export interface ExecuteMessage {
  sender: string
  contract: string
  msg: {
    execute: {
      msgs: CosmosMsg[]
    }
  }
  funds: Coin[]
}

export interface FreezeMessage {
  sender: string
  contract: string
  msg: {
    freeze: Record<string, unknown>
  }
  funds: Coin[]
}

export interface UpdateAdminsMessage {
  sender: string
  contract: string
  msg: {
    update_admins: {
      admins: string[]
    }
  }
  funds: Coin[]
}

export interface IncreaseAllowanceMessage {
  sender: string
  contract: string
  msg: {
    increase_allowance: {
      recipient: string
      amount: string
    }
  }
  funds: Coin[]
}

export interface DecreaseAllowanceMessage {
  sender: string
  contract: string
  msg: {
    decrease_allowance: {
      recipient: string
      amount: string
    }
  }
  funds: Coin[]
}

export interface SetPermissionsMessage {
  sender: string
  contract: string
  msg: {
    set_permissions: {
      spender: string
      permissions: Permissions
    }
  }
  funds: Coin[]
}

export interface CW1SubkeysContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW1SubkeysInstance

  messages: () => CW1SubkeysMessages
}

export const CW1Subkeys = (client: SigningCosmWasmClient, txSigner: string): CW1SubkeysContract => {
  const use = (contractAddress: string): CW1SubkeysInstance => {
    const allowance = async (address?: string) => {
      return client.queryContractSmart(contractAddress, {
        allowance: { spender: address },
      }) as Promise<AllowanceInfo>
    }

    const allAllowances = async (startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        all_allowances: { start_after: startAfter, limit },
      }) as Promise<AllAllowancesResponse>
    }

    const permissions = async (address?: string) => {
      return client.queryContractSmart(contractAddress, {
        permissions: { spender: address },
      }) as Promise<PermissionsInfo>
    }

    const allPermissions = async (startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        all_permissions: { start_after: startAfter, limit },
      }) as Promise<AllPermissionsResponse>
    }

    const canExecute = async (sender: string, msg: CosmosMsg) => {
      return client.queryContractSmart(contractAddress, {
        can_execute: { sender, msg },
      }) as Promise<CanExecuteResponse>
    }

    const admins = async () => {
      return client.queryContractSmart(contractAddress, { admin_list: {} }) as Promise<AdminListResponse>
    }

    const freeze = async (senderAddress: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { freeze: {} }, 'auto')
      return result.transactionHash
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const updateAdmins = async (senderAddress: string, admins: readonly string[]): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { update_admins: { admins } }, 'auto')
      return result.transactionHash
    }

    const execute = async (senderAddress: string, msgs: readonly CosmosMsg[]): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { execute: { msgs } }, 'auto')
      return result.transactionHash
    }

    const increaseAllowance = async (
      senderAddress: string,
      spender: string,
      amount: Coin,
      expires?: Expiration,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { increase_allowance: { spender, amount, expires } },
        'auto',
      )
      return result.transactionHash
    }

    const decreaseAllowance = async (
      senderAddress: string,
      spender: string,
      amount: Coin,
      expires?: Expiration,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { decrease_allowance: { spender, amount, expires } },
        'auto',
      )
      return result.transactionHash
    }

    // eslint-disable-next-line @typescript-eslint/no-shadow
    const setPermissions = async (senderAddress: string, spender: string, permissions: Permissions) => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { set_permissions: { spender, permissions } },
        'auto',
      )
      return result.transactionHash
    }

    return {
      contractAddress,
      admins,
      allowance,
      allAllowances,
      permissions,
      allPermissions,
      canExecute,
      execute,
      freeze,
      updateAdmins,
      increaseAllowance,
      decreaseAllowance,
      setPermissions,
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
    const execute = (contractAddress: string, msgs: CosmosMsg[]): any => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          execute: { msgs },
        },
        funds: [],
      }
    }

    const freeze = (contractAddress: string): any => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          freeze: {},
        },
        funds: [],
      }
    }

    const updateAdmins = (contractAddress: string, admins: string[]): any => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          update_admins: { admins },
        },
        funds: [],
      }
    }

    const increaseAllowance = (
      contractAddress: string,
      recipient: string,
      amount: string,
    ): IncreaseAllowanceMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          increase_allowance: { recipient, amount },
        },
        funds: [],
      }
    }

    const decreaseAllowance = (
      contractAddress: string,
      recipient: string,
      amount: string,
    ): DecreaseAllowanceMessage => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          decrease_allowance: { recipient, amount },
        },
        funds: [],
      }
    }

    const setPermissions = (contractAddress: string, spender: string, permissions: Permissions): any => {
      return {
        sender: txSigner,
        contract: contractAddress,
        msg: {
          set_permissions: { spender, permissions },
        },
        funds: [],
      }
    }

    return {
      execute,
      freeze,
      updateAdmins,
      increaseAllowance,
      decreaseAllowance,
      setPermissions,
    }
  }

  return { use, instantiate, messages }
}
