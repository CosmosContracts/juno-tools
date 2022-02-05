export const TESTNET_CW20_MERKLE_DROP_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_TESTNET_CW20_MERKLE_DROP_CODE_ID as string,
  10
)

export const TESTNET_CW20_BASE_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_TESTNET_CW20_BASE_CODE_ID as string,
  10
)

export const TESTNET_CW20_BONDING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_TESTNET_CW20_BONDING_CODE_ID as string,
  10
)

export const TESTNET_CW20_STAKING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_TESTNET_CW20_STAKING_CODE_ID as string,
  10
)

export const TESTNET_CW1_SUBKEYS_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_TESTNET_CW1_SUBKEYS_CODE_ID as string,
  10
)

export const MAINNET_CW20_MERKLE_DROP_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MAINNET_CW20_MERKLE_DROP_CODE_ID as string,
  10
)

export const MAINNET_CW20_BASE_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MAINNET_CW20_BASE_CODE_ID as string,
  10
)

export const MAINNET_CW20_BONDING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MAINNET_CW20_BONDING_CODE_ID as string,
  10
)

export const MAINNET_CW20_STAKING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MAINNET_CW20_STAKING_CODE_ID as string,
  10
)

export const MAINNET_CW1_SUBKEYS_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_MAINNET_CW1_SUBKEYS_CODE_ID as string,
  10
)

export interface AirdropProps {
  name: string
  contractAddress: string
  merkleRoot: string
  cw20TokenAddress: string
  totalAmount: number
  activeStep: string
  start: number | null
  expiration: number | null
}
