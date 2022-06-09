import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { CW1SubkeysContract, CW1SubkeysInstance, CW1SubkeysMessages } from './contract'
import { CW1Subkeys as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW1SubkeysContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW1SubkeysInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  messages: () => CW1SubkeysMessages | undefined
}

export function useCW1SubkeysContract(): UseCW1SubkeysContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW1Subkeys, setCW1Subkeys] = useState<CW1SubkeysContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const cw20BaseContract = initContract(wallet.getClient(), wallet.address)
    setCW1Subkeys(cw20BaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW1Subkeys) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        CW1Subkeys.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [CW1Subkeys, wallet],
  )

  const use = useCallback(
    (customAddress = ''): CW1SubkeysInstance | undefined => {
      return CW1Subkeys?.use(address || customAddress)
    },
    [CW1Subkeys, address],
  )

  const messages = useCallback((): CW1SubkeysMessages | undefined => {
    return CW1Subkeys?.messages()
  }, [CW1Subkeys])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
