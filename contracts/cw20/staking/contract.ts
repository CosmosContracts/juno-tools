import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toBase64, toUtf8 } from '@cosmjs/encoding'
import type { Decimal } from '@cosmjs/math'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'

const jsonToBinary = (json: Record<string, unknown>): string => {
  return toBase64(toUtf8(JSON.stringify(json)))
}

type Expiration = { at_height: number } | { at_time: string } | { never: object }

interface AllowanceResponse {
  readonly allowance: string
  readonly expires: Expiration
}

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

interface InvestmentResponse {
  readonly token_supply: string
  readonly staked_tokens: Coin
  readonly nominal_value: Decimal
  readonly owner: string
  readonly exit_tax: Decimal
  readonly validator: string
  readonly min_withdrawal: string
}

interface Claim {
  readonly amount: string
  readonly release_at: Expiration
}

interface ClaimsResponse {
  readonly claims: Claim[]
}

interface TokenInfoResponse {
  readonly name: string
  readonly symbol: string
  readonly decimals: number
  readonly total_supply: string
}

export interface CW20StakingInstance {
  readonly contractAddress: string

  // Queries
  claims: (address: string) => Promise<ClaimsResponse>
  investment: () => Promise<InvestmentResponse>
  balance: (address: string) => Promise<string>
  allowance: (owner: string, spender: string) => Promise<AllowanceResponse>
  tokenInfo: () => Promise<TokenInfoResponse>

  // Execute
  bond: (txSigner: string, amount: string) => Promise<string>
  unbond: (txSigner: string, amount: string) => Promise<string>
  claim: (txSigner: string) => Promise<string>
  reinvest: (txSigner: string) => Promise<string>
  transfer: (txSigner: string, recipient: string, amount: string) => Promise<string>
  burn: (txSigner: string, amount: string) => Promise<string>
  send: (txSigner: string, contract: string, amount: string, msg: Record<string, unknown>) => Promise<string>
  increaseAllowance: (txSigner: string, spender: string, amount: string, expires?: Expiration) => Promise<string>
  decreaseAllowance: (txSigner: string, spender: string, amount: string, expires?: Expiration) => Promise<string>
  transferFrom: (txSigner: string, owner: string, recipient: string, amount: string) => Promise<string>
  sendFrom: (
    txSigner: string,
    owner: string,
    contract: string,
    amount: string,
    msg: Record<string, unknown>,
  ) => Promise<string>
  burnFrom: (txSigner: string, owner: string, amount: string) => Promise<string>
}

export interface CW20StakingContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW20StakingInstance
}

export const CW20Staking = (client: SigningCosmWasmClient): CW20StakingContract => {
  const use = (contractAddress: string): CW20StakingInstance => {
    const balance = async (address: string): Promise<string> => {
      const result = await client.queryContractSmart(contractAddress, {
        balance: { address },
      })
      return result.balance
    }

    const allowance = async (owner: string, spender: string): Promise<AllowanceResponse> => {
      return client.queryContractSmart(contractAddress, {
        allowance: { owner, spender },
      })
    }

    const tokenInfo = async (): Promise<TokenInfoResponse> => {
      return client.queryContractSmart(contractAddress, { token_info: {} })
    }

    const claims = async (address: string): Promise<ClaimsResponse> => {
      return client.queryContractSmart(contractAddress, { claims: { address } })
    }

    const investment = async (): Promise<InvestmentResponse> => {
      return client.queryContractSmart(contractAddress, { investment: {} })
    }

    const bond = async (senderAddress: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { bond: {} }, 'auto', '', [
        coin(amount, 'ujunox'),
      ])
      return result.transactionHash
    }

    const unbond = async (senderAddress: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { unbond: { amount } }, 'auto')
      return result.transactionHash
    }

    const claim = async (senderAddress: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { claim: {} }, 'auto')
      return result.transactionHash
    }

    const reinvest = async (senderAddress: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { reinvest: {} }, 'auto')
      return result.transactionHash
    }

    const transfer = async (senderAddress: string, recipient: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { transfer: { recipient, amount } }, 'auto')
      return result.transactionHash
    }

    const burn = async (senderAddress: string, amount: string): Promise<string> => {
      const result = await client.execute(senderAddress, contractAddress, { burn: { amount } }, 'auto')
      return result.transactionHash
    }

    const increaseAllowance = async (
      senderAddress: string,
      spender: string,
      amount: string,
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
      amount: string,
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
      const result = await client.execute(senderAddress, contractAddress, { send_from: { owner, amount } }, 'auto')
      return result.transactionHash
    }

    return {
      contractAddress,
      balance,
      allowance,
      tokenInfo,
      claims,
      investment,
      bond,
      unbond,
      claim,
      reinvest,
      transfer,
      burn,
      send,
      increaseAllowance,
      decreaseAllowance,
      transferFrom,
      sendFrom,
      burnFrom,
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

  return { instantiate, use }
}
