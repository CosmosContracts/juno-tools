import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import {
  CW20MerkleAirdrop as initContract,
  CW20MerkleAirdropContract,
  CW20MerkleAirdropInstance,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20MerkleAirdropContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20MerkleAirdropInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW20MerkleAirdropContract(): UseCW20MerkleAirdropContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20MerkleAirdrop, setCW20MerkleAirdrop] =
    useState<CW20MerkleAirdropContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW20MerkleAirdropInstance = async (): Promise<void> => {
        const client = wallet.getClient()
        const cw20MerkleAirdropContract = initContract(client, wallet.address)
        setCW20MerkleAirdrop(cw20MerkleAirdropContract)
      }

      getCW20MerkleAirdropInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20MerkleAirdrop) return reject('Contract is not initialized.')
        CW20MerkleAirdrop.instantiate(
          wallet.address,
          codeId,
          initMsg,
          label,
          admin
        )
          .then(resolve)
          .catch(reject)
      })
    },
    [CW20MerkleAirdrop, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW20MerkleAirdropInstance | undefined => {
      return CW20MerkleAirdrop?.use(address || customAddress)
    },
    [CW20MerkleAirdrop, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
