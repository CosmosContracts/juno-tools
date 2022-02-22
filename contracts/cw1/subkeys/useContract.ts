import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import {
  CW1Subkeys as initContract,
  CW1SubkeysContract,
  CW1SubkeysInstance,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW1SubkeysContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW1SubkeysInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW1SubkeysContract(): UseCW1SubkeysContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW1Subkeys, setCW1Subkeys] = useState<CW1SubkeysContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW20BaseInstance = async (): Promise<void> => {
        const cw20BaseContract = initContract(wallet.getClient())
        setCW1Subkeys(cw20BaseContract)
      }

      getCW20BaseInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW1Subkeys) return reject('Contract is not initialized.')
        CW1Subkeys.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW1Subkeys, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW1SubkeysInstance | undefined => {
      return CW1Subkeys?.use(address || customAddress)
    },
    [CW1Subkeys, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
