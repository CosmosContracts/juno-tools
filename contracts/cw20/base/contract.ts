import { toUtf8, toBase64 } from '@cosmjs/encoding'
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}

export type Expiration =
  | { at_height: number }
  | { at_time: string }
  | { never: {} }

export interface AllowanceResponse {
  readonly allowance: string
  readonly expires: Expiration
}

export interface AllowanceInfo {
  readonly allowance: string
  readonly spender: string
  readonly expires: Expiration
}

export interface AllAllowancesResponse {
  readonly allowances: readonly AllowanceInfo[]
}

export interface AllAccountsResponse {
  readonly accounts: readonly string[]
}

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface CW20BaseInstance {
  readonly contractAddress: string

  // Queries
  balance: (address: string) => Promise<string>
  allowance: (owner: string, spender: string) => Promise<AllowanceResponse>
  allAllowances: (
    owner: string,
    startAfter?: string,
    limit?: number
  ) => Promise<AllAllowancesResponse>
  allAccounts: (
    startAfter?: string,
    limit?: number
  ) => Promise<readonly string[]>
  tokenInfo: () => Promise<any>
  minter: () => Promise<any>

  // Execute
  mint: (txSigner: string, recipient: string, amount: string) => Promise<string>
  transfer: (
    txSigner: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  send: (
    txSigner: string,
    recipient: string,
    amount: string,
    msg: Record<string, unknown>
  ) => Promise<string>
  burn: (txSigner: string, amount: string) => Promise<string>
  increaseAllowance: (
    txSigner: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  decreaseAllowance: (
    txSigner: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  transferFrom: (
    txSigner: string,
    owner: string,
    recipient: string,
    amount: string
  ) => Promise<string>
  sendFrom: (
    txSigner: string,
    owner: string,
    recipient: string,
    amount: string,
    msg: Record<string, unknown>
  ) => Promise<string>
}

export interface CW20BaseContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW20BaseInstance
}

export const CW20Base = (client: SigningCosmWasmClient): CW20BaseContract => {
  const use = (contractAddress: string): CW20BaseInstance => {
    const balance = async (address: string): Promise<string> => {
      const result = await client.queryContractSmart(contractAddress, {
        balance: { address },
      })
      return result.balance
    }

    const allowance = async (
      owner: string,
      spender: string
    ): Promise<AllowanceResponse> => {
      return client.queryContractSmart(contractAddress, {
        allowance: { owner, spender },
      })
    }

    const allAllowances = async (
      owner: string,
      startAfter?: string,
      limit?: number
    ): Promise<AllAllowancesResponse> => {
      return client.queryContractSmart(contractAddress, {
        all_allowances: { owner, start_after: startAfter, limit },
      })
    }

    const allAccounts = async (
      startAfter?: string,
      limit?: number
    ): Promise<readonly string[]> => {
      const accounts: AllAccountsResponse = await client.queryContractSmart(
        contractAddress,
        {
          all_accounts: { start_after: startAfter, limit },
        }
      )
      return accounts.accounts
    }

    const tokenInfo = async (): Promise<any> => {
      return client.queryContractSmart(contractAddress, { token_info: {} })
    }

    const minter = async (): Promise<any> => {
      return client.queryContractSmart(contractAddress, { minter: {} })
    }

    const mint = async (
      senderAddress: string,
      recipient: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { mint: { recipient, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const transfer = async (
      senderAddress: string,
      recipient: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { transfer: { recipient, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const burn = async (
      senderAddress: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { burn: { amount } },
        'auto'
      )
      return result.transactionHash
    }

    const increaseAllowance = async (
      senderAddress: string,
      spender: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { increase_allowance: { spender, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const decreaseAllowance = async (
      senderAddress: string,
      spender: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { decrease_allowance: { spender, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const transferFrom = async (
      senderAddress: string,
      owner: string,
      recipient: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { transfer_from: { owner, recipient, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const send = async (
      senderAddress: string,
      recipient: string,
      amount: string,
      msg: Record<string, unknown>
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send: { recipient, amount, msg: jsonToBinary(msg) } },
        'auto'
      )
      return result.transactionHash
    }

    const sendFrom = async (
      senderAddress: string,
      owner: string,
      recipient: string,
      amount: string,
      msg: Record<string, unknown>
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, recipient, amount, msg: jsonToBinary(msg) } },
        'auto'
      )
      return result.transactionHash
    }

    return {
      contractAddress,
      balance,
      allowance,
      allAllowances,
      allAccounts,
      tokenInfo,
      minter,
      mint,
      transfer,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      send,
      sendFrom,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ): Promise<InstantiateResponse> => {
    const result = await client.instantiate(
      senderAddress,
      codeId,
      initMsg,
      label,
      'auto',
      {
        memo: `Init ${label}`,
        admin,
      }
    )

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  return { instantiate, use }
}
