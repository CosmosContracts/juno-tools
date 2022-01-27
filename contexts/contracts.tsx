import React from 'react'
import {
  UseCW20BaseContractProps,
  useCW20BaseContract,
} from 'contracts/cw20/base'
import {
  UseCW20BondingContractProps,
  useCW20BondingContract,
} from 'contracts/cw20/bonding'
import {
  UseCW20StakingContractProps,
  useCW20StakingContract,
} from 'contracts/cw20/staking'
import {
  UseCW1SubkeysContractProps,
  useCW1SubkeysContract,
} from 'contracts/cw1/subkeys'

interface ContractsContextType {
  cw20Base: UseCW20BaseContractProps | null
  cw20Bonding: UseCW20BondingContractProps | null
  cw20Staking: UseCW20StakingContractProps | null
  cw1Subkeys: UseCW1SubkeysContractProps | null
}

const defaultContext: ContractsContextType = {
  cw20Base: null,
  cw20Bonding: null,
  cw20Staking: null,
  cw1Subkeys: null,
}

const ContractsContext =
  React.createContext<ContractsContextType>(defaultContext)

export const useContracts = (): ContractsContextType =>
  React.useContext(ContractsContext)

export function ContractsProvider({
  children,
}: React.HTMLAttributes<HTMLOrSVGElement>): JSX.Element {
  const cw20Base = useCW20BaseContract()
  const cw20Bonding = useCW20BondingContract()
  const cw20Staking = useCW20StakingContract()
  const cw1Subkeys = useCW1SubkeysContract()

  const value: ContractsContextType = {
    cw20Base,
    cw20Bonding,
    cw20Staking,
    cw1Subkeys,
  }

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  )
}
