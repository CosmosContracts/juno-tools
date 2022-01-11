import { toUtf8, toBase64 } from '@cosmjs/encoding'
export { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

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

export const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}
