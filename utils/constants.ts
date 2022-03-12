export const CW20_MERKLE_DROP_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_CW20_MERKLE_DROP_CODE_ID as string,
  10
)
export const CW20_BASE_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_CW20_BASE_CODE_ID as string,
  10
)
export const CW20_BONDING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_CW20_BONDING_CODE_ID as string,
  10
)
export const CW20_STAKING_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_CW20_STAKING_CODE_ID as string,
  10
)
export const CW1_SUBKEYS_CODE_ID = parseInt(
  process.env.NEXT_PUBLIC_CW1_SUBKEYS_CODE_ID as string,
  10
)

export const NETWORK = process.env.NEXT_PUBLIC_NETWORK as string

export const S3_ENDPOINT = process.env.NEXT_PUBLIC_S3_ENDPOINT as string
export const S3_REGION = process.env.NEXT_PUBLIC_S3_REGION as string
export const S3_KEY = process.env.NEXT_PUBLIC_S3_KEY as string
export const S3_SECRET = process.env.NEXT_PUBLIC_S3_SECRET as string
export const S3_BUCKET = process.env.NEXT_PUBLIC_S3_BUCKET as string

export const ESCROW_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS as string
export const ESCROW_AMOUNT = parseFloat(
  process.env.NEXT_PUBLIC_ESCROW_AMOUNT as string
)

export const BLOCK_EXPLORER_URL = process.env
  .NEXT_PUBLIC_BLOCK_EXPLORER_URL as string

export interface AirdropProps {
  name: string
  contractAddress: string
  merkleRoot: string
  cw20TokenAddress: string
  totalAmount: number
  activeStep: string
  start: number | null
  startType: string | null
  expiration: number | null
  expirationType: string | null
  processing?: boolean
  escrow?: boolean
  escrowStatus?: string
  status?: string
  accountsSize?: number
}
