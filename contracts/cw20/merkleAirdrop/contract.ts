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
  claim_msg: SignedClaimMsg
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
  withdraw: (stage: number, address: string) => Promise<string>
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
  withdraw: (airdropAddress: string, stage: number, address: string) => WithdrawMessage
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

    const withdraw = async (stage: number, address: string): Promise<string> => {
      const result = await client.execute(txSigner, contractAddress, { withdraw: { stage, address } }, fee)
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
      totalClaimed,
      updateConfig,
      registerMerkleRoot,
      claim,
      burn,
      withdraw,
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

    const fundWithSend = (recipient: string, amount: string): FundWithSendMessage => {
      return {
        from_address: txSigner,
        to_address: recipient,
        amount: [coin(amount, getNetworkConfig(NETWORK).feeToken)],
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

    return {
      instantiate,
      registerAndReleaseEscrow,
      depositEscrow,
      claim,
      fundWithSend,
      burn,
      withdraw,
    }
  }

  return { instantiate, use, messages }
}
