import { useContracts } from 'contexts/contracts'
import type { WalletContextType } from 'contexts/wallet'
import { useWallet } from 'contexts/wallet'
import type { InstantiateResponse } from 'contracts/cw1/subkeys'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { CW20_BASE_CODE_ID } from 'utils/constants'

export interface InstantiateFormData {
  name: string
  symbol: string
  decimals: number
  initialBalance?: number
  minterAddress?: string
  cap?: number
  projectName?: string
  description?: string
  marketingAddress?: string
  logoUrl?: string
}

export const useInstantiateCw20Form = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

  const form = useForm<InstantiateFormData>()
  const [result, setResult] = useState<InstantiateResponse | null>(null)

  const submitHandler = form.handleSubmit(async (data) => {
    console.log(data)

    try {
      setResult(null)

      if (!contract) {
        return toast.error('Smart contract connection failed.')
      }

      const msg = createInstantiateMsg({ wallet, data })

      setResult(await contract.instantiate(CW20_BASE_CODE_ID, msg, msg.name, wallet.address))
    } catch (error: any) {
      console.error(error)
      toast.error(error?.message)
    }
  })

  useEffect(() => {
    if (wallet.address) {
      form.setValue('minterAddress', wallet.address)
      form.setValue('marketingAddress', wallet.address)
    }
  }, [form, wallet.address])

  return { ...form, result, submitHandler }
}

export const createInstantiateMsg = ({ wallet, data }: { wallet: WalletContextType; data: InstantiateFormData }) => {
  return {
    name: data.name,
    symbol: data.symbol,
    decimals: data.decimals,
    initial_balances: [
      {
        address: wallet.address,
        amount: data.initialBalance,
      },
    ],
    mint: {
      minter: data.minterAddress,
      cap: data.cap,
    },
    marketing: {
      project: data.projectName,
      description: data.description,
      marketing: data.marketingAddress,
      logo: {
        url: data.logoUrl,
      },
    },
  }
}
