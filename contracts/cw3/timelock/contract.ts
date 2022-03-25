import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate'

export interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export type Expiration =
  | { at_height: number }
  | { at_time: string }
  | { never: {} }

export interface CW3TimelockInstance {
  readonly contractAddress: string

  //Query
  getAdmins: () => Promise<any>
  getOperations: () => Promise<any>
  getMinDelay: () => Promise<any>
  getExecutionTime: (id: number) => Promise<any>
  getOperationStatus: (id: number) => Promise<any>

  //Execute
  schedule: (
    senderAddress: string,
    contractAddress: string,
    txMsg: Record<string, unknown>
  ) => Promise<string>

  //   execute: (
  //    senderAddress: string,
  //    msgs: readonly CosmosMsg[]
  //    ) => Promise<string>
}

export interface CW3TimelockContract {
  instantiate: (
    senderAddress: string,
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>

  use: (contractAddress: string) => CW3TimelockInstance
}

export const CW3Timelock = (
  client: SigningCosmWasmClient
): CW3TimelockContract => {
  const use = (contractAddress: string): CW3TimelockInstance => {
    const CONTRACT_ADDRESS =
      'juno17cjuw3a25qwd5ms6ty2f8jrtecx88du08k0w2480quuupqncu4sq646kmh'

    //Query
    const getOperations = async (): Promise<any> => {
      const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_operations: {},
      })
      console.log('get operations  ', res)

      return res
    }
    const getMinDelay = async (): Promise<any> => {
      const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_min_delay: {},
      })
      console.log('getmindelay  ', res)

      return res
    }
    const getAdmins = async (): Promise<string> => {
      const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_admins: {},
      })
      console.log('get admins  ', res)
      return res
    }

    const getExecutionTime = async (id: number): Promise<any> => {
      const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_execution_time: { operation_id: id },
      })
      console.log('get execution time  ', res)
      return res
    }
    const getOperationStatus = async (id: number): Promise<any> => {
      const res = await client.queryContractSmart(CONTRACT_ADDRESS, {
        get_operation_status: { operation_id: id },
      })
      console.log('get execution time  ', res)
      return res
    }
    //Execute
    const schedule = async (
      senderAddress: string,
      contractAddress: string,
      txMsg: Record<string, unknown>
    ): Promise<string> => {
      const res = await client.execute(
        senderAddress,
        contractAddress,
        txMsg,
        'auto'
      )
      return res.transactionHash
    }

    return {
      contractAddress,
      schedule,
      getAdmins,
      getOperations,
      getMinDelay,
      getExecutionTime,
      getOperationStatus,
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
        admin,
      }
    )
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  return { use, instantiate }
}
