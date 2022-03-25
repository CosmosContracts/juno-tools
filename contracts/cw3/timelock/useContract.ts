import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'contexts/wallet'
import {
  CW3TimelockContract,
  CW3TimelockInstance,
  CW3Timelock as initContract,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW3TimelockContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW3TimelockInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW3TimelockContract(): UseCW3TimelockContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW3Timelock, setCW3Timelock] = useState<CW3TimelockContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW3BaseInstance = async (): Promise<void> => {
        const cw3BaseContract = initContract(wallet.getClient())
        setCW3Timelock(cw3BaseContract)
      }

      getCW3BaseInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW3Timelock) return reject('Contract is not initialized.')

        CW3Timelock.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW3Timelock, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW3TimelockInstance | undefined => {
      return CW3Timelock?.use(address || customAddress)
    },
    [CW3Timelock, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
