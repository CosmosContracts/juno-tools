import { useWallet } from 'contexts/wallet'
import { useCallback, useEffect, useState } from 'react'

import {
  CW20Bonding as initContract,
  CW20BondingContract,
  CW20BondingInstance,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20BondingContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20BondingInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW20BondingContract(): UseCW20BondingContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20Bonding, setCW20Bonding] = useState<CW20BondingContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW20BondingInstance = async (): Promise<void> => {
        const cw20BondingContract = initContract(wallet.getClient())
        setCW20Bonding(cw20BondingContract)
      }

      getCW20BondingInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (
      codeId: number,
      initMsg: Record<string, unknown>,
      label: string,
      admin?: string
    ): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20Bonding) return reject('Contract is not initialized.')
        CW20Bonding.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW20Bonding, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW20BondingInstance | undefined => {
      return CW20Bonding?.use(address || customAddress)
    },
    [CW20Bonding, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
