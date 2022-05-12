import type { UseCW1SubkeysContractProps } from 'contracts/cw1/subkeys'
import { useCW1SubkeysContract } from 'contracts/cw1/subkeys'
import type { UseCW20BaseContractProps } from 'contracts/cw20/base'
import { useCW20BaseContract } from 'contracts/cw20/base'
import type { UseCW20BondingContractProps } from 'contracts/cw20/bonding'
import { useCW20BondingContract } from 'contracts/cw20/bonding'
import type { UseCW20MerkleAirdropContractProps } from 'contracts/cw20/merkleAirdrop'
import { useCW20MerkleAirdropContract } from 'contracts/cw20/merkleAirdrop'
import type { UseCW20StakingContractProps } from 'contracts/cw20/staking'
import { useCW20StakingContract } from 'contracts/cw20/staking'
import type { UseCW721BaseContractProps } from 'contracts/cw721/base'
import { useCW721BaseContract } from 'contracts/cw721/base'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import type { State } from 'zustand'
import create from 'zustand'

/**
 * Contracts store type definitions
 */
export interface ContractsStore extends State {
  cw20Base: UseCW20BaseContractProps | null
  cw20Bonding: UseCW20BondingContractProps | null
  cw20Staking: UseCW20StakingContractProps | null
  cw20MerkleAirdrop: UseCW20MerkleAirdropContractProps | null
  cw1Subkeys: UseCW1SubkeysContractProps | null
  cw721Base: UseCW721BaseContractProps | null
}

/**
 * Contracts store default values as a separate variable for reusability
 */
export const defaultValues: ContractsStore = {
  cw20Base: null,
  cw20Bonding: null,
  cw20Staking: null,
  cw20MerkleAirdrop: null,
  cw1Subkeys: null,
  cw721Base: null,
}

/**
 * Entrypoint for contracts store using {@link defaultValues}
 */
export const useContracts = create<ContractsStore>(() => ({
  ...defaultValues,
}))

/**
 * Contracts store provider to easily mount {@link ContractsSubscription}
 * to listen/subscribe to contract changes
 */
export const ContractsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      <ContractsSubscription />
    </>
  )
}

/**
 * Contracts store subscriptions (side effects)
 *
 * TODO: refactor all contract logics to zustand store
 */
const ContractsSubscription = () => {
  const cw20Base = useCW20BaseContract()
  const cw20Bonding = useCW20BondingContract()
  const cw20Staking = useCW20StakingContract()
  const cw20MerkleAirdrop = useCW20MerkleAirdropContract()
  const cw1Subkeys = useCW1SubkeysContract()
  const cw721Base = useCW721BaseContract()

  useEffect(() => {
    useContracts.setState({
      cw20Base,
      cw20Bonding,
      cw20Staking,
      cw20MerkleAirdrop,
      cw1Subkeys,
      cw721Base,
    })
  }, [
    cw20Base,
    cw20Bonding,
    cw20Staking,
    cw20MerkleAirdrop,
    cw1Subkeys,
    cw721Base,
    //
  ])

  return null
}
