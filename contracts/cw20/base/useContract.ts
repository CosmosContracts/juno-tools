import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { CW20BaseContract, CW20BaseInstance, CW20BaseMessages } from './contract'
import { CW20Base as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20BaseContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20BaseInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  messages: () => CW20BaseMessages | undefined
}

export function useCW20BaseContract(): UseCW20BaseContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20Base, setCW20Base] = useState<CW20BaseContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const cw20BaseContract = initContract(wallet.getClient(), wallet.address)
    setCW20Base(cw20BaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20Base) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        CW20Base.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [CW20Base, wallet],
  )

  const use = useCallback(
    (customAddress = ''): CW20BaseInstance | undefined => {
      return CW20Base?.use(address || customAddress)
    },
    [CW20Base, address],
  )

  const messages = useCallback((): CW20BaseMessages | undefined => {
    return CW20Base?.messages()
  }, [CW20Base])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
