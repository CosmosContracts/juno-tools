import type { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import type { Coin } from '@cosmjs/proto-signing'
import { coin } from '@cosmjs/proto-signing'
import { isDeliverTxFailure } from '@cosmjs/stargate'
import { getConfig as getNetworkConfig } from 'config'
import { TxRaw } from 'cosmjs-types/cosmos/tx/v1beta1/tx'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { ESCROW_AMOUNT, ESCROW_CONTRACT_ADDRESS, NETWORK } from 'utils/constants'
import { getExecuteFee } from 'utils/fees'

// TODO: Split messages into a different file and import

type Expiration = { at_height: number } | { at_time: string } | null

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

interface GetConfigResponse {
  owner: string
  cw20_token_address: string
}

interface GetMerkleRootResponse {
  merkle_root: string
  stage: number
  start: Expiration
  expiration: Expiration
  total_amount: string
}

interface ExecuteWithSignDataResponse {
  signed: TxRaw
  txHash: string
}

interface SignedClaimMsg {
  addr: string
}

export interface SignedMessage {
  claim_msg: string | SignedClaimMsg
  signature: string
}

export interface CW20MerkleAirdropInstance {
  readonly contractAddress: string

  // Queries
  getConfig: () => Promise<GetConfigResponse>
  getMerkleRoot: (stage: number) => Promise<GetMerkleRootResponse>
  getLatestStage: () => Promise<number>
  isClaimed: (address: string, stage: number) => Promise<boolean>
  totalClaimed: (stage: number) => Promise<string>
  isPaused: (stage: number) => Promise<boolean>
  getContractVersion: () => Promise<string>

  // Execute
  updateConfig: (txSigner: string, newOwner: string) => Promise<string>
  registerMerkleRoot: (
    txSigner: string,
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    total_amount: number,
  ) => Promise<string>
  claim: (stage: number, amount: string, proof: string[], signedMessage?: SignedMessage) => Promise<string>
  burn: (stage: number) => Promise<string>
  burnAll: () => Promise<string>
  withdraw: (stage: number, address: string) => Promise<string>
  withdrawAll: (address: string, amount?: number) => Promise<string>
  pause: (stage: number) => Promise<string>
  resume: (stage: number, newExpiration?: Expiration) => Promise<string>
  registerAndReleaseEscrow: (
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    totalAmount: number,
    stage: number,
    hrp?: string,
  ) => Promise<ExecuteWithSignDataResponse>
  depositEscrow: () => Promise<ExecuteWithSignDataResponse>
  fundWithSend: (amount: string) => Promise<ExecuteWithSignDataResponse>
}

export interface CW20MerkleAirdropMessages {
  instantiate: (codeId: number, label: string, msg: Record<string, unknown>) => InstantiateMessage
  registerAndReleaseEscrow: (
    airdropAddress: string,
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    totalAmount: number,
    stage: number,
    hrp?: string,
  ) => [RegisterMessage, ReleaseEscrowMessage]
  depositEscrow: (airdropAddress: string) => DepositEscrowMessage
  claim: (
    airdropAddress: string,
    stage: number,
    amount: string,
    proof: string[],
    signedMessage?: SignedMessage,
  ) => ClaimMessage
  fundWithSend: (recipient: string, amount: string) => FundWithSendMessage
  burn: (airdropAddress: string, stage: number) => BurnMessage
  burnAll: (airdropAddress: string) => BurnAllMessage
  withdraw: (airdropAddress: string, stage: number, address: string) => WithdrawMessage
  withdrawAll: (airdropAddress: string, address: string, amount?: number) => WithdrawAllMessage
  pause: (airdropAddress: string, stage: number) => PauseMessage
  resume: (airdropAddress: string, stage: number, new_expiration?: Expiration) => ResumeMessage
}

export interface InstantiateMessage {
  txSigner: string
  codeId: number
  msg: Record<string, unknown>
  label: string
  funds: Coin[]
  admin?: string
}

export interface RegisterMessage {
  sender: string
  contract: string
  msg: {
    register_merkle_root: {
      merkle_root: string
      start: Expiration
      expiration: Expiration
      total_amount: number
      hrp?: string
    }
  }
  funds: Coin[]
}

export interface ReleaseEscrowMessage {
  sender: string
  contract: string
  msg: {
    release_locked_funds: {
      airdrop_addr: string
      stage: number
    }
  }
  funds: Coin[]
}

export interface DepositEscrowMessage {
  sender: string
  contract: string
  msg: {
    lock_funds: {
      airdrop_addr: string
    }
  }
  funds: Coin[]
}

export interface ClaimMessage {
  sender: string
  contract: string
  msg: {
    claim: {
      stage: number
      amount: string
      proof: string[]
      sig_info?: SignedMessage
    }
  }
  funds: Coin[]
}

export interface FundWithSendMessage {
  from_address: string
  to_address: string
  amount: Coin[]
}

export interface BurnMessage {
  sender: string
  contract: string
  msg: {
    burn: {
      stage: number
    }
  }
  funds: Coin[]
}

export interface BurnAllMessage {
  sender: string
  contract: string
  msg: {
    burn_all: Record<string, never>
  }
  funds: Coin[]
}

export interface WithdrawMessage {
  sender: string
  contract: string
  msg: {
    withdraw: {
      stage: number
      address: string
    }
  }
  funds: Coin[]
}

export interface WithdrawAllMessage {
  sender: string
  contract: string
  msg: {
    withdraw_all: {
      address: string
      amount?: number
    }
  }
  funds: Coin[]
}

export interface PauseMessage {
  sender: string
  contract: string
  msg: {
    pause: {
      stage: number
    }
  }
  funds: Coin[]
}
export interface ResumeMessage {
  sender: string
  contract: string
  msg: {
    resume: {
      stage: number
      new_expiration?: Expiration
    }
  }
  funds: Coin[]
}

export interface CW20MerkleAirdropContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW20MerkleAirdropInstance

  messages: () => CW20MerkleAirdropMessages
}

export const CW20MerkleAirdrop = (client: SigningCosmWasmClient, txSigner: string): CW20MerkleAirdropContract => {
  const use = (contractAddress: string): CW20MerkleAirdropInstance => {
    const fee = getExecuteFee()

    const getConfig = async (): Promise<GetConfigResponse> => {
      return client.queryContractSmart(contractAddress, {
        config: {},
      })
    }

    const getMerkleRoot = async (stage: number): Promise<GetMerkleRootResponse> => {
      return client.queryContractSmart(contractAddress, {
        merkle_root: { stage },
      })
    }

    const getLatestStage = async (): Promise<number> => {
      const data = await client.queryContractSmart(contractAddress, {
        latest_stage: {},
      })
      return data.latest_stage
    }

    const isClaimed = async (address: string, stage: number): Promise<boolean> => {
      const data = await client.queryContractSmart(contractAddress, {
        is_claimed: { address, stage },
      })
      return data.is_claimed
    }

    const isPaused = async (stage: number): Promise<boolean> => {
      const data = await client.queryContractSmart(contractAddress, {
        is_paused: { stage },
      })
      return data.is_paused
    }

    const getContractVersion = async (): Promise<string> => {
      console.log('here')
      const data = await client.queryContractRaw(
        contractAddress,
        toUtf8(Buffer.from(Buffer.from('contract_info').toString('hex'), 'hex').toString()),
      )
      console.log(JSON.parse(new TextDecoder().decode(data as Uint8Array)))
      return JSON.parse(new TextDecoder().decode(data as Uint8Array)).version
    }

    const totalClaimed = async (stage: number): Promise<string> => {
      const data = await client.queryContractSmart(contractAddress, {
        total_claimed: { stage },
      })
      return data.total_claimed
    }

    const updateConfig = async (_txSigner: string, newOwner: string): Promise<string> => {
      const result = await client.execute(
        _txSigner,
        contractAddress,
        { update_config: { new_owner: newOwner } },
        'auto',
      )
      return result.transactionHash
    }

    const registerMerkleRoot = async (
      _txSigner: string,
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number,
    ): Promise<string> => {
      const result = await client.execute(
        _txSigner,
        contractAddress,
        {
          register_merkle_root: {
            merkle_root: merkleRoot,
            start,
            expiration,
            total_amount: totalAmount,
          },
        },
        'auto',
      )
      return result.transactionHash
    }

    const claim = async (
      stage: number,
      amount: string,
      proof: string[],
      signedMessage?: SignedMessage,
    ): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { claim: { stage, amount, proof, sig_info: signedMessage } },
        fee,
      )
      return result.transactionHash
    }

    const burn = async (stage: number): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { burn: { stage } }, fee)
      return result.transactionHash
    }
    const burnAll = async (): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { burn_all: {} }, fee)
      return result.transactionHash
    }

    const withdraw = async (stage: number, address: string): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { withdraw: { stage, address } }, fee)
      return result.transactionHash
    }

    const withdrawAll = async (address: string, amount?: number): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { withdraw_all: { address, amount: amount?.toString() } },
        fee,
      )
      return result.transactionHash
    }

    const pause = async (stage: number): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { pause: { stage } }, fee)
      return result.transactionHash
    }

    const resume = async (stage: number, newExpiration?: Expiration): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { resume: { stage, new_expiration: newExpiration } },
        fee,
      )
      return result.transactionHash
    }

    const registerAndReleaseEscrow = async (
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number,
      stage: number,
      hrp?: string,
    ): Promise<ExecuteWithSignDataResponse> => {
      const signed = await client.sign(
        txSigner,
        [
          // Airdrop contract register message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: contractAddress,
              msg: toUtf8(
                JSON.stringify({
                  register_merkle_root: {
                    merkle_root: merkleRoot,
                    start,
                    expiration,
                    total_amount: totalAmount.toString(),
                    hrp,
                  },
                }),
              ),
            }),
          },
          // Escrow contract release message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: ESCROW_CONTRACT_ADDRESS,
              msg: toUtf8(
                JSON.stringify({
                  release_locked_funds: {
                    airdrop_addr: contractAddress,
                    stage,
                  },
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

    const depositEscrow = async (): Promise<ExecuteWithSignDataResponse> => {
      const config = getNetworkConfig(NETWORK)
      const signed = await client.sign(
        txSigner,
        [
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: txSigner,
              contract: ESCROW_CONTRACT_ADDRESS,
              msg: toUtf8(
                JSON.stringify({
                  lock_funds: {
                    airdrop_addr: contractAddress,
                  },
                }),
              ),
              funds: [coin(ESCROW_AMOUNT * 1000000, config.feeToken)],
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

    const fundWithSend = async (amount: string): Promise<ExecuteWithSignDataResponse> => {
      const config = getNetworkConfig(NETWORK)
      const signed = await client.sign(
        txSigner,
        [
          {
            typeUrl: '/cosmos.bank.v1beta1.MsgSend',
            value: {
              fromAddress: txSigner,
              toAddress: contractAddress,
              amount: [coin(amount, config.feeToken)],
            },
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

    return {
      contractAddress,
      getConfig,
      getMerkleRoot,
      getLatestStage,
      isClaimed,
      isPaused,
      getContractVersion,
      totalClaimed,
      updateConfig,
      registerMerkleRoot,
      claim,
      burn,
      burnAll,
      withdraw,
      withdrawAll,
      pause,
      resume,
      registerAndReleaseEscrow,
      depositEscrow,
      fundWithSend,
    }
  }

  const instantiate = async (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ): Promise<InstantiateResponse> => {
    const fee = getExecuteFee()
    const result = await client.instantiate(senderAddress, codeId, initMsg, label, fee, {
      memo: '',
      admin,
    })
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  const messages = () => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const instantiate = (codeId: number, label: string, msg: Record<string, unknown>): InstantiateMessage => {
      return {
        txSigner,
        codeId,
        label,
        msg,
        funds: [],
        admin: txSigner,
      }
    }

    const registerAndReleaseEscrow = (
      airdropAddress: string,
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number,
      stage: number,
      hrp?: string,
    ): [RegisterMessage, ReleaseEscrowMessage] => {
      return [
        {
          sender: txSigner,
          contract: airdropAddress,
          msg: {
            register_merkle_root: {
              merkle_root: merkleRoot,
              start,
              expiration,
              total_amount: totalAmount,
              hrp,
            },
          },
          funds: [],
        },
        {
          sender: txSigner,
          contract: ESCROW_CONTRACT_ADDRESS,
          msg: {
            release_locked_funds: {
              airdrop_addr: airdropAddress,
              stage,
            },
          },
          funds: [],
        },
      ]
    }

    const depositEscrow = (airdropAddress: string): DepositEscrowMessage => {
      return {
        sender: txSigner,
        contract: ESCROW_CONTRACT_ADDRESS,
        msg: {
          lock_funds: {
            airdrop_addr: airdropAddress,
          },
        },
        funds: [coin(ESCROW_AMOUNT * 1000000, getNetworkConfig(NETWORK).feeToken)],
      }
    }

    const claim = (
      airdropAddress: string,
      stage: number,
      amount: string,
      proof: string[],
      signedMessage?: SignedMessage,
    ): ClaimMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          claim: {
            stage,
            amount,
            proof,
            sig_info: signedMessage,
          },
        },
        funds: [],
      }
    }

    const burn = (airdropAddress: string, stage: number): BurnMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          burn: {
            stage,
          },
        },
        funds: [],
      }
    }
    const burnAll = (airdropAddress: string): BurnAllMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          burn_all: {},
        },
        funds: [],
      }
    }
    const withdraw = (airdropAddress: string, stage: number, address: string): WithdrawMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          withdraw: {
            stage,
            address,
          },
        },
        funds: [],
      }
    }
    const withdrawAll = (airdropAddress: string, address: string, amount?: number): WithdrawAllMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          withdraw_all: {
            address,
            amount,
          },
        },
        funds: [],
      }
    }

    const pause = (airdropAddress: string, stage: number): PauseMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          pause: {
            stage,
          },
        },
        funds: [],
      }
    }

    const resume = (airdropAddress: string, stage: number, newExpiration?: Expiration): ResumeMessage => {
      return {
        sender: txSigner,
        contract: airdropAddress,
        msg: {
          resume: {
            stage,
            new_expiration: newExpiration,
          },
        },
        funds: [],
      }
    }

    const fundWithSend = (recipient: string, amount: string): FundWithSendMessage => {
      return {
        from_address: txSigner,
        to_address: recipient,
        amount: [coin(amount, getNetworkConfig(NETWORK).feeToken)],
      }
    }

    return {
      instantiate,
      registerAndReleaseEscrow,
      depositEscrow,
      claim,
      fundWithSend,
      burn,
      burnAll,
      withdraw,
      withdrawAll,
      pause,
      resume,
    }
  }

  return { instantiate, use, messages }
}
