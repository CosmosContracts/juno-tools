import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import { toUtf8 } from '@cosmjs/encoding'
import { useWallet } from 'contexts/wallet'
import { MsgExecuteContract } from 'cosmjs-types/cosmwasm/wasm/v1/tx'
import { ESCROW_CONTRACT_ADDRESS } from 'utils/constants'

type Expiration = { at_height: number } | { at_time: string } | { never: {} }

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface CW20MerkleAirdropInstance {
  readonly contractAddress: string

  // Queries
  getConfig: () => Promise<any>
  getMerkleRoot: (stage: number) => Promise<any>
  getLatestStage: () => Promise<any>
  isClaimed: (address: string, stage: number) => Promise<any>
  totalClaimed: (stage: number) => Promise<any>

  // Execute
  updateConfig: (newOwner: string) => Promise<string>
  registerMerkleRoot: (
    merkleRoot: string,
    start: Expiration,
    expiration: Expiration,
    total_amount: number
  ) => Promise<string>
  claim: (stage: number, amount: string, proof: string[]) => Promise<string>
  burn: (stage: number) => Promise<string>
  registerAndReleaseEscrow: (
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
  const wallet = useWallet()

  const use = (contractAddress: string): CW20MerkleAirdropInstance => {
    const getConfig = async (): Promise<any> => {
      return client.queryContractSmart(contractAddress, {
        config: {},
      })
    }

    const getMerkleRoot = async (stage: number): Promise<any> => {
      return client.queryContractSmart(contractAddress, {
        merkle_root: { stage },
      })
    }

    const getLatestStage = async (): Promise<any> => {
      return client.queryContractSmart(contractAddress, {
        latest_stage: {},
      })
    }

    const isClaimed = async (address: string, stage: number): Promise<any> => {
      return client.queryContractSmart(contractAddress, {
        is_claimed: { address, stage },
      })
    }

    const totalClaimed = async (stage: number): Promise<any> => {
      return client.queryContractSmart(contractAddress, {
        total_claimed: { stage },
      })
    }

    const updateConfig = async (newOwner: string): Promise<string> => {
      const result = await client.execute(
        wallet.address,
        contractAddress,
        { update_config: { new_owner: newOwner } },
        'auto'
      )
      return result.transactionHash
    }

    const registerMerkleRoot = async (
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number
    ): Promise<string> => {
      const result = await client.execute(
        wallet.address,
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
      stage: number,
      amount: string,
      proof: string[]
    ): Promise<string> => {
      const result = await client.execute(
        wallet.address,
        contractAddress,
        { claim: { stage, amount, proof } },
        'auto'
      )
      return result.transactionHash
    }

    const burn = async (stage: number): Promise<string> => {
      const result = await client.execute(
        wallet.address,
        contractAddress,
        { burn: { stage } },
        'auto'
      )
      return result.transactionHash
    }

    const registerAndReleaseEscrow = async (
      merkleRoot: string,
      start: Expiration,
      expiration: Expiration,
      totalAmount: number,
      stage: number
    ): Promise<string> => {
      const result = await client.signAndBroadcast(
        wallet.address,
        [
          // Airdrop contract register message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: wallet.address,
              contract: contractAddress,
              msg: toUtf8(
                JSON.stringify({
                  register_merkle_root: {
                    merkle_root: merkleRoot,
                    start,
                    expiration,
                    total_amount: totalAmount,
                  },
                })
              ),
            }),
          },
          // Escrow contract release message
          {
            typeUrl: '/cosmwasm.wasm.v1.MsgExecuteContract',
            value: MsgExecuteContract.fromPartial({
              sender: wallet.address,
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
