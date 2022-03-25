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
  getAdmins: (contractAddress: string) => Promise<any>

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
    //Query
    const getAdmins = async (
      contractAddress: string,
      
    ): Promise<string> => {
      const res = await client.queryContractSmart(
        'juno16cps0cp958sx9e9lz52rc9tzvrm7shs9ne8nakkhqydm06nkgeasszskda',
        {
          get_admins: {},
        }
      )
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
      625,
      {
        admins: [""],
        proposers:[""],
        min_delay: 3600000000000,
      },
      'Timelock Test',
      'auto',
    )
    console.log(result);
    return {
      contractAddress: result.contractAddress,
      transactionHash: result.transactionHash,
    }
  }

  return { use, instantiate }
}
