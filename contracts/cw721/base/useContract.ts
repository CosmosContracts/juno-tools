import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import type { CW721BaseContract, CW721BaseInstance, CW721BaseMessages } from './contract'
import { CW721Base as initContract } from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW721BaseContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string,
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW721BaseInstance | undefined
  updateContractAddress: (contractAddress: string) => void
  messages: () => CW721BaseMessages | undefined
}

export function useCW721BaseContract(): UseCW721BaseContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW721Base, setCW721Base] = useState<CW721BaseContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    const cw721BaseContract = initContract(wallet.getClient(), wallet.address)
    setCW721Base(cw721BaseContract)
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId: number, initMsg: Record<string, unknown>, label: string, admin?: string): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW721Base) {
          reject(new Error('Contract is not initialized.'))
          return
        }
        CW721Base.instantiate(wallet.address, codeId, initMsg, label, admin).then(resolve).catch(reject)
      })
    },
    [CW721Base, wallet],
  )

  const use = useCallback(
    (customAddress = ''): CW721BaseInstance | undefined => {
      return CW721Base?.use(address || customAddress)
    },
    [CW721Base, address],
  )

  const messages = useCallback((): CW721BaseMessages | undefined => {
    return CW721Base?.messages()
  }, [CW721Base])

  return {
    instantiate,
    use,
    updateContractAddress,
    messages,
  }
}
