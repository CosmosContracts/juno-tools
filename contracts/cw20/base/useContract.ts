import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import {
  CW20Base as initContract,
  CW20BaseContract,
  CW20BaseInstance,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20BaseContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20BaseInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW20BaseContract(): UseCW20BaseContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20Base, setCW20Base] = useState<CW20BaseContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW20BaseInstance = async (): Promise<void> => {
        const client = wallet.getClient()
        const cw20BaseContract = initContract(client, wallet.address)
        setCW20Base(cw20BaseContract)
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
        if (!CW20Base) return reject('Contract is not initialized.')
        CW20Base.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW20Base, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW20BaseInstance | undefined => {
      return CW20Base?.use(address || customAddress)
    },
    [CW20Base, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
