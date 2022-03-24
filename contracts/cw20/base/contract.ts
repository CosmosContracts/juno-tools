import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toBase64, toUtf8 } from '@cosmjs/encoding'
import { Coin } from '@cosmjs/proto-signing'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import getExecuteFee from 'utils/fees'

const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}

type Expiration = { at_height: number } | { at_time: string } | { never: {} }

type Logo =
  | { url: string }
  | {
      embedded:
        | {
            svg: string
          }
        | { png: string }
    }

interface AllowanceResponse {
  readonly allowance: string
  readonly expires: Expiration
}

interface AllowanceInfo {
  readonly allowance: string
  readonly spender: string
  readonly expires: Expiration
}

interface AllAllowancesResponse {
  readonly allowances: readonly AllowanceInfo[]
}

interface AllAccountsResponse {
  readonly accounts: readonly string[]
}

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

interface MinterResponse {
  readonly minter: string
  readonly cap?: string
}

export interface TokenInfoResponse {
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly total_supply: string
}

interface ExecuteWithSignDataResponse {
  signed: TxRaw
  txHash: string
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
  tokenInfo: () => Promise<TokenInfoResponse>
  minter: () => Promise<MinterResponse>
  marketingInfo: () => Promise<string>

  // Execute
  mint: (
    recipient: string,
    amount: string
  ) => Promise<ExecuteWithSignDataResponse>
  transfer: (
    recipient: string,
    amount: string
  ) => Promise<ExecuteWithSignDataResponse>
  send: (
    txSigner: string,
    contract: string,
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
    contract: string,
    amount: string,
    msg: Record<string, unknown>
  ) => Promise<string>
  burnFrom: (txSigner: string, owner: string, amount: string) => Promise<string>
  updateMarketing: (
    txSigner: string,
    project: string,
    description: string,
    marketing: string
  ) => Promise<string>
  uploadLogo: (txSigner: string, logo: Logo) => Promise<string>
}

export interface CW20BaseMessages {
  mint: (
    cw20TokenAddress: string,
    recipient: string,
    amount: string
  ) => MintMessage
}

export interface MintMessage {
  sender: string
  contract: string
  msg: {
    mint: {
      recipient: string
      amount: string
    }
  }
  funds: Coin[]
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

  messages: () => CW20BaseMessages
}

export const CW20Base = (
  client: SigningCosmWasmClient,
  txSigner: string
): CW20BaseContract => {
  const fee = getExecuteFee()

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

    const tokenInfo = async (): Promise<TokenInfoResponse> => {
      return client.queryContractSmart(contractAddress, { token_info: {} })
    }

    const minter = async (): Promise<MinterResponse> => {
      return client.queryContractSmart(contractAddress, { minter: {} })
    }

    const marketingInfo = async (): Promise<string> => {
      return client.queryContractSmart(contractAddress, { marketing_info: {} })
    }

    const mint = async (
      recipient: string,
      amount: string
    ): Promise<ExecuteWithSignDataResponse> => {
      const signed = await client.sign(
        txSigner,
        [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: contractAddress,
              msg: toUtf8(
                JSON.stringify({
                  mint: { recipient, amount },
                })
              ),
            }),
          },
        ],
        fee,
        ''
      )
      const result = await client.broadcastTx(TxRaw.encode(signed).finish())
      return {
        signed,
        txHash: result.transactionHash,
      }
    }

    const transfer = async (
      recipient: string,
      amount: string
    ): Promise<ExecuteWithSignDataResponse> => {
      const signed = await client.sign(
        txSigner,
        [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: contractAddress,
              msg: toUtf8(
                JSON.stringify({
                  transfer: { recipient, amount },
                })
              ),
            }),
          },
        ],
        fee,
        ''
      )
      const result = await client.broadcastTx(TxRaw.encode(signed).finish())
      return {
        signed,
        txHash: result.transactionHash,
      }
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
      contract: string,
      amount: string,
      msg: Record<string, unknown>
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send: { contract, amount, msg: jsonToBinary(msg) } },
        'auto'
      )
      return result.transactionHash
    }

    const sendFrom = async (
      senderAddress: string,
      owner: string,
      contract: string,
      amount: string,
      msg: Record<string, unknown>
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, contract, amount, msg: jsonToBinary(msg) } },
        'auto'
      )
      return result.transactionHash
    }

    const burnFrom = async (
      senderAddress: string,
      owner: string,
      amount: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { burn_from: { owner, amount } },
        'auto'
      )
      return result.transactionHash
    }

    const updateMarketing = async (
      senderAddress: string,
      project: string,
      description: string,
      marketing: string
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { update_marketing: { project, description, marketing } },
        'auto'
      )
      return result.transactionHash
    }

    const uploadLogo = async (
      senderAddress: string,
      logo: Logo
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { upload_logo: { ...logo } },
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
      marketingInfo,
      mint,
      transfer,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      send,
      sendFrom,
      burnFrom,
      updateMarketing,
      uploadLogo,
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
        memo: '',
        admin,
      }
    )

    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = () => {
    const mint = (
      cw20TokenAddress: string,
      recipient: string,
      amount: string
    ): MintMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          mint: { recipient, amount },
        },
        funds: [],
      }
    }

    return {
      mint,
    }
  }

  return { instantiate, use, messages }
}
