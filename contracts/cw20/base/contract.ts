import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toBase64, toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import { isDeliverTxFailure } from '@cosmjs/stargate'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { getExecuteFee } from 'utils/fees'

const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}

type Expiration = { at_height: number } | { at_time: string } | { never: object }

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
  allAllowances: (owner: string, startAfter?: string, limit?: number) => Promise<AllAllowancesResponse>
  allAccounts: (startAfter?: string, limit?: number) => Promise<readonly string[]>
  tokenInfo: () => Promise<TokenInfoResponse>
  minter: () => Promise<MinterResponse>
  marketingInfo: () => Promise<string>

  // Execute
  mint: (recipient: string, amount: string) => Promise<ExecuteWithSignDataResponse>
  transfer: (recipient: string, amount: string) => Promise<ExecuteWithSignDataResponse>
  send: (txSigner: string, contract: string, amount: string, msg: Record<string, unknown>) => Promise<string>
  burn: (txSigner: string, amount: string) => Promise<string>
  increaseAllowance: (txSigner: string, recipient: string, amount: string) => Promise<string>
  decreaseAllowance: (txSigner: string, recipient: string, amount: string) => Promise<string>
  transferFrom: (txSigner: string, owner: string, recipient: string, amount: string) => Promise<string>
  sendFrom: (
    txSigner: string,
    owner: string,
    contract: string,
    amount: string,
    msg: Record<string, unknown>,
  ) => Promise<string>
  burnFrom: (txSigner: string, owner: string, amount: string) => Promise<string>
  updateMarketing: (txSigner: string, project: string, description: string, marketing: string) => Promise<string>
  uploadLogo: (txSigner: string, logo: Logo) => Promise<string>
}

export interface CW20BaseMessages {
  mint: (cw20TokenAddress: string, recipient: string, amount: string) => MintMessage
  transfer: (cw20TokenAddress: string, recipient: string, amount: string) => TransferMessage
  send: (cw20TokenAddress: string, contract: string, amount: string, msg: Record<string, unknown>) => SendMessage
  burn: (cw20TokenAddress: string, amount: string) => BurnMessage
  increaseAllowance: (cw20TokenAddress: string, recipient: string, amount: string) => IncreaseAllowanceMessage
  decreaseAllowance: (cw20TokenAddress: string, recipient: string, amount: string) => DecreaseAllowanceMessage
  transferFrom: (cw20TokenAddress: string, owner: string, recipient: string, amount: string) => TransferFromMessage
  sendFrom: (
    cw20TokenAddress: string,
    owner: string,
    contract: string,
    amount: string,
    msg: Record<string, unknown>,
  ) => SendFromMessage
  burnFrom: (cw20TokenAddress: string, owner: string, amount: string) => BurnFromMessage
  updateMarketing: (
    cw20TokenAddress: string,
    project: string,
    description: string,
    marketing: string,
  ) => UpdateMarketingMessage
  uploadLogo: (cw20TokenAddress: string, url: string) => UploadLogoMessage
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

export interface TransferMessage {
  sender: string
  contract: string
  msg: {
    transfer: {
      recipient: string
      amount: string
    }
  }
  funds: Coin[]
}

export interface SendMessage {
  sender: string
  contract: string
  msg: {
    send: {
      contract: string
      amount: string
      msg: Record<string, unknown>
    }
  }
  funds: Coin[]
}

export interface BurnMessage {
  sender: string
  contract: string
  msg: {
    burn: {
      amount: string
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

export interface TransferFromMessage {
  sender: string
  contract: string
  msg: {
    transfer_from: {
      owner: string
      recipient: string
      amount: string
    }
  }
  funds: Coin[]
}

export interface SendFromMessage {
  sender: string
  contract: string
  msg: {
    send_from: {
      owner: string
      contract: string
      amount: string
      msg: Record<string, unknown>
    }
  }
  funds: Coin[]
}

export interface BurnFromMessage {
  sender: string
  contract: string
  msg: {
    burn_from: {
      owner: string
      amount: string
    }
  }
  funds: Coin[]
}

export interface UpdateMarketingMessage {
  sender: string
  contract: string
  msg: {
    update_marketing: {
      project: string
      description: string
      marketing: string
    }
  }
  funds: Coin[]
}

export interface UploadLogoMessage {
  sender: string
  contract: string
  msg: {
    upload_logo: {
      logo: {
        url: string
      }
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
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW20BaseInstance

  messages: () => CW20BaseMessages
}

export const CW20Base = (client: SigningCosmWasmClient, txSigner: string): CW20BaseContract => {
  const fee = getExecuteFee()

  const use = (contractAddress: string): CW20BaseInstance => {
    const balance = async (address: string) => {
      const result = await client.queryContractSmart(contractAddress, {
        balance: { address },
      })
      return result.balance as Promise<string>
    }

    const allowance = async (owner: string, spender: string) => {
      return client.queryContractSmart(contractAddress, {
        allowance: { owner, spender },
      }) as Promise<AllowanceResponse>
    }

    const allAllowances = async (owner: string, startAfter?: string, limit?: number) => {
      return client.queryContractSmart(contractAddress, {
        all_allowances: { owner, start_after: startAfter, limit },
      }) as Promise<AllAllowancesResponse>
    }

    const allAccounts = async (startAfter?: string, limit?: number): Promise<readonly string[]> => {
      const accounts: AllAccountsResponse = await client.queryContractSmart(contractAddress, {
        all_accounts: { start_after: startAfter, limit },
      })
      return accounts.accounts
    }

    const tokenInfo = async () => {
      return client.queryContractSmart(contractAddress, { token_info: {} }) as Promise<TokenInfoResponse>
    }

    const minter = async () => {
      return client.queryContractSmart(contractAddress, { minter: {} }) as Promise<MinterResponse>
    }

    const marketingInfo = async () => {
      return client.queryContractSmart(contractAddress, { marketing_info: {} }) as Promise<string>
    }

    const mint = async (recipient: string, amount: string): Promise<ExecuteWithSignDataResponse> => {
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
                }),
              ),
            }),
          },
        ],
        fee,
        '',
      )
      const result = await client.broadcastTx(TxRaw.encode(signed).finish())
      if (isDeliverTxFailure(result)) {
        throw new Error(
          [
            `Error when broadcasting tx ${result.transactionHash} at height ${result.height}.`,
            `Code: ${result.code}; Raw log: ${result.rawLog ?? ''}`,
          ].join(' '),
        )
      }
      return {
        signed,
        txHash: result.transactionHash,
      }
    }

    const transfer = async (recipient: string, amount: string): Promise<ExecuteWithSignDataResponse> => {
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
                }),
              ),
            }),
          },
        ],
        fee,
        '',
      )
      const result = await client.broadcastTx(TxRaw.encode(signed).finish())
      if (isDeliverTxFailure(result)) {
        throw new Error(
          [
            `Error when broadcasting tx ${result.transactionHash} at height ${result.height}.`,
            `Code: ${result.code}; Raw log: ${result.rawLog ?? ''}`,
          ].join(' '),
        )
      }
      return {
        signed,
        txHash: result.transactionHash,
      }
    }

    const burn = async (senderAddress: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { burn: { amount } }, 'auto')
      return result.transactionHash
    }

    const increaseAllowance = async (senderAddress: string, spender: string, amount: string): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { increase_allowance: { spender, amount } },
        'auto',
      )
      return result.transactionHash
    }

    const decreaseAllowance = async (senderAddress: string, spender: string, amount: string): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { decrease_allowance: { spender, amount } },
        'auto',
      )
      return result.transactionHash
    }

    const transferFrom = async (
      senderAddress: string,
      owner: string,
      recipient: string,
      amount: string,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { transfer_from: { owner, recipient, amount } },
        'auto',
      )
      return result.transactionHash
    }

    const send = async (
      senderAddress: string,
      contract: string,
      amount: string,
      msg: Record<string, unknown>,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send: { contract, amount, msg: jsonToBinary(msg) } },
        'auto',
      )
      return result.transactionHash
    }

    const sendFrom = async (
      senderAddress: string,
      owner: string,
      contract: string,
      amount: string,
      msg: Record<string, unknown>,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { send_from: { owner, contract, amount, msg: jsonToBinary(msg) } },
        'auto',
      )
      return result.transactionHash
    }

    const burnFrom = async (senderAddress: string, owner: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { burn_from: { owner, amount } }, 'auto')
      return result.transactionHash
    }

    const updateMarketing = async (
      senderAddress: string,
      project: string,
      description: string,
      marketing: string,
    ): Promise<string> => {
      const result = await client.execute(
        senderAddress,
        contractAddress,
        { update_marketing: { project, description, marketing } },
        'auto',
      )
      return result.transactionHash
    }

    const uploadLogo = async (senderAddress: string, logo: Logo): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { upload_logo: { ...logo } }, 'auto')
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
    const mint = (cw20TokenAddress: string, recipient: string, amount: string): MintMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          mint: { recipient, amount },
        },
        funds: [],
      }
    }

    const transfer = (cw20TokenAddress: string, recipient: string, amount: string): TransferMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          transfer: { recipient, amount },
        },
        funds: [],
      }
    }

    const send = (
      cw20TokenAddress: string,
      contract: string,
      amount: string,
      msg: Record<string, unknown>,
    ): SendMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          send: { contract, amount, msg },
        },
        funds: [],
      }
    }

    const burn = (cw20TokenAddress: string, amount: string): BurnMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          burn: { amount },
        },
        funds: [],
      }
    }

    const increaseAllowance = (
      cw20TokenAddress: string,
      recipient: string,
      amount: string,
    ): IncreaseAllowanceMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          increase_allowance: { recipient, amount },
        },
        funds: [],
      }
    }

    const decreaseAllowance = (
      cw20TokenAddress: string,
      recipient: string,
      amount: string,
    ): DecreaseAllowanceMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          decrease_allowance: { recipient, amount },
        },
        funds: [],
      }
    }

    const transferFrom = (
      cw20TokenAddress: string,
      owner: string,
      recipient: string,
      amount: string,
    ): TransferFromMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          transfer_from: { owner, recipient, amount },
        },
        funds: [],
      }
    }

    const sendFrom = (
      cw20TokenAddress: string,
      owner: string,
      contract: string,
      amount: string,
      msg: Record<string, unknown>,
    ): SendFromMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          send_from: { owner, contract, amount, msg },
        },
        funds: [],
      }
    }

    const burnFrom = (cw20TokenAddress: string, owner: string, amount: string): BurnFromMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          burn_from: { owner, amount },
        },
        funds: [],
      }
    }

    const updateMarketing = (
      cw20TokenAddress: string,
      project: string,
      description: string,
      marketing: string,
    ): UpdateMarketingMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          update_marketing: { project, description, marketing },
        },
        funds: [],
      }
    }

    const uploadLogo = (cw20TokenAddress: string, url: string): UploadLogoMessage => {
      return {
        sender: txSigner,
        contract: cw20TokenAddress,
        msg: {
          upload_logo: { logo: { url } },
        },
        funds: [],
      }
    }

    return {
      mint,
      transfer,
      send,
      burn,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      sendFrom,
      burnFrom,
      updateMarketing,
      uploadLogo,
    }
  }

  return { instantiate, use, messages }
}
