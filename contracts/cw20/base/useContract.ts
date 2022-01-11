import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'contexts/wallet'
import {
  CW20BaseContract,
  CW20BaseInstance,
  CW20Base as initContract,
} from './contract'
import { InstantiateResponse } from '../common'

interface InstantiateProps {
  codeId: number
  initMsg: Record<string, unknown>
  label: string
}

export interface UseCW20BaseContractProps {
  instantiate: ({
    codeId,
    initMsg,
    label,
  }: InstantiateProps) => Promise<InstantiateResponse>
  use: () => CW20BaseInstance | undefined
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
        const cw20BaseContract = initContract(wallet.getClient())
        setCW20Base(cw20BaseContract)
      }

      getCW20BaseInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    ({
      codeId,
      initMsg,
      label,
    }: InstantiateProps): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20Base) return reject('Contract is not initialized.')
        CW20Base.instantiate(wallet.address, codeId, initMsg, label)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW20Base, wallet]
  )

  const use = useCallback((): CW20BaseInstance | undefined => {
    return CW20Base?.use(address)
  }, [CW20Base, address])

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
