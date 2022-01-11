import React from 'react'
import {
  UseCW20BaseContractProps,
  useCW20BaseContract,
} from 'contracts/cw20/base'

interface ContractsContextType {
  cw20Base: UseCW20BaseContractProps | null
}

const defaultContext: ContractsContextType = {
  cw20Base: null,
}

const ContractsContext =
  React.createContext<ContractsContextType>(defaultContext)

export const useContracts = (): ContractsContextType =>
  React.useContext(ContractsContext)

export function ContractsProvider({
  children,
}: React.HTMLAttributes<HTMLOrSVGElement>): JSX.Element {
  const cw20Base = useCW20BaseContract()

  const value: ContractsContextType = { cw20Base }

  return (
    <ContractsContext.Provider value={value}>
      {children}
    </ContractsContext.Provider>
  )
}
