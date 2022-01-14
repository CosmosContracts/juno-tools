import { useCallback, useEffect, useState } from 'react'
import { useWallet } from 'contexts/wallet'
import {
  CW20StakingContract,
  CW20StakingInstance,
  CW20Staking as initContract,
} from './contract'

interface InstantiateResponse {
  readonly contractAddress: string
  readonly transactionHash: string
}

export interface UseCW20StakingContractProps {
  instantiate: (
    codeId: number,
    initMsg: Record<string, unknown>,
    label: string,
    admin?: string
  ) => Promise<InstantiateResponse>
  use: (customAddress: string) => CW20StakingInstance | undefined
  updateContractAddress: (contractAddress: string) => void
}

export function useCW20StakingContract(): UseCW20StakingContractProps {
  const wallet = useWallet()

  const [address, setAddress] = useState<string>('')
  const [CW20Staking, setCW20Staking] = useState<CW20StakingContract>()

  useEffect(() => {
    setAddress(localStorage.getItem('contract_address') || '')
  }, [])

  useEffect(() => {
    if (wallet.initialized) {
      const getCW20StakingInstance = async (): Promise<void> => {
        const cw20StakingContract = initContract(wallet.getClient())
        setCW20Staking(cw20StakingContract)
      }

      getCW20StakingInstance()
    }
  }, [wallet])

  const updateContractAddress = (contractAddress: string) => {
    setAddress(contractAddress)
  }

  const instantiate = useCallback(
    (codeId, initMsg, label, admin?): Promise<InstantiateResponse> => {
      return new Promise((resolve, reject) => {
        if (!CW20Staking) return reject('Contract is not initialized.')
        CW20Staking.instantiate(wallet.address, codeId, initMsg, label, admin)
          .then(resolve)
          .catch(reject)
      })
    },
    [CW20Staking, wallet]
  )

  const use = useCallback(
    (customAddress = ''): CW20StakingInstance | undefined => {
      return CW20Staking?.use(address || customAddress)
    },
    [CW20Staking, address]
  )

  return {
    instantiate,
    use,
    updateContractAddress,
  }
}
