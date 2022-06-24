import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { CW20MerkleAirdropContract, CW20MerkleAirdropInstance, CW20MerkleAirdropMessages } from './contract'
import { CW20MerkleAirdrop as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20MerkleAirdropContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20MerkleAirdropInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  messages: () => CW20MerkleAirdropMessages | undefined
}

export function useCW20MerkleAirdropContract(): UseCW20MerkleAirdropContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20MerkleAirdrop, setCW20MerkleAirdrop] = useState<CW20MerkleAirdropContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const client = wallet.getClient()
    if (!client) return
    const cw20MerkleAirdropContract = initContract(client, wallet.address)
    setCW20MerkleAirdrop(cw20MerkleAirdropContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20MerkleAirdrop) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        CW20MerkleAirdrop.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [CW20MerkleAirdrop, wallet],
  )

  const use = useCallback(
    (customAddress = ''): CW20MerkleAirdropInstance | undefined => {
      return CW20MerkleAirdrop?.use(address || customAddress)
    },
    [CW20MerkleAirdrop, address],
  )

  const messages = useCallback((): CW20MerkleAirdropMessages | undefined => {
    return CW20MerkleAirdrop?.messages()
  }, [CW20MerkleAirdrop])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
