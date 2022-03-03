import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { ESCROW_CONTRACT_ADDRESS } from 'utils/constants'

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

interface IsClaimedResponse {
  is_claimed: boolean
}

interface TotalClaimedResponse {
  total_claimed: string
}

export interface CW20MerkleAirdropInstance {
  readonly contractAddress: string

  // Queries
  getConfig: () => Promise<GetConfigResponse>
  getMerkleRoot: (stage: number) => Promise<GetMerkleRootResponse>
  getLatestStage: () => Promise<number>
  isClaimed: (address: string, stage: number) => Promise<IsClaimedResponse>
  totalClaimed: (stage: number) => Promise<TotalClaimedResponse>

  // Execute
  updateConfig: (txSigner: string, newOwner: string) => Promise<string>
  registerMerkleRoot: (
    txSigner: string,
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    total_amount: number
  ) => Promise<string>
  claim: (
    txSigner: string,
    stage: number,
    amount: string,
    proof: string[]
  ) => Promise<string>
  burn: (txSigner: string, stage: number) => Promise<string>
  registerAndReleaseEscrow: (
    txSigner: string,
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    totalAmount: number,
    stage: number
  ) => Promise<string>
}

export interface CW20MerkleAirdropContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW20MerkleAirdropInstance
}

export const CW20MerkleAirdrop = (
  client: SigningCosmWasmClient
): CW20MerkleAirdropContract => {
  const use = (contractAddress: string): CW20MerkleAirdropInstance => {
    const getConfig = async (): Promise<GetConfigResponse> => {
      return client.queryContractSmart(contractAddress, {
        config: {},
      })
    }

    const getMerkleRoot = async (
      stage: number
    ): Promise<GetMerkleRootResponse> => {
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

    const isClaimed = async (
      address: string,
      stage: number
    ): Promise<IsClaimedResponse> => {
      return client.queryContractSmart(contractAddress, {
        is_claimed: { address, stage },
      })
    }

    const totalClaimed = async (
      stage: number
    ): Promise<TotalClaimedResponse> => {
      return client.queryContractSmart(contractAddress, {
        total_claimed: { stage },
      })
    }

    const updateConfig = async (
      txSigner: string,
      newOwner: string
    ): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { update_config: { new_owner: newOwner } },
        'auto'
      )
      return result.transactionHash
    }

    const registerMerkleRoot = async (
      txSigner: string,
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number
    ): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        {
          register_merkle_root: {
            merkle_root: merkleRoot,
            start,
            expiration,
            total_amount: totalAmount,
          },
        },
        'auto'
      )
      return result.transactionHash
    }

    const claim = async (
      txSigner: string,
      stage: number,
      amount: string,
      proof: string[]
    ): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { claim: { stage, amount, proof } },
        'auto'
      )
      return result.transactionHash
    }

    const burn = async (txSigner: string, stage: number): Promise<string> => {
      const result = await client.execute(
        txSigner,
        contractAddress,
        { burn: { stage } },
        'auto'
      )
      return result.transactionHash
    }

    const registerAndReleaseEscrow = async (
      txSigner: string,
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number,
      stage: number
    ): Promise<string> => {
      const result = await client.signAndBroadcast(
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
                    // total_amount: totalAmount,
                  },
                })
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
                })
              ),
            }),
          },
        ],
        'auto'
      )
      return result.transactionHash
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
      registerAndReleaseEscrow,
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

  return { instantiate, use }
}
