import clsx from 'clsx'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { FormControl } from 'components/FormControl'
import { AddressInput, NumberInput, ValidatorAddressInput } from 'components/forms/FormInput'
import { useInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw1SubkeysLinkTabs } from 'components/LinkTabs.data'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'
import type { QueryType } from 'utils/contracts/cw1/subkeys/query'
import { dispatchQuery, QUERY_EXECUTE_LIST, QUERY_LIST } from 'utils/contracts/cw1/subkeys/query'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const CW1SubkeysQueryPage: NextPage = () => {
  const { cw1Subkeys: contract } = useContracts()
  const wallet = useWallet()

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'CW1 Subkeys Address',
    subtitle: 'Address of the CW1 Subkeys contract',
  })
  const address = contractState.value

  const ownerState = useInputState({
    id: 'owner-address',
    name: 'owner-address',
    title: 'Owner Address',
    subtitle: 'Address of the user - defaults to current address',
  })
  const ownerAddress = ownerState.value

  const toAddressState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const validatorState = useInputState({
    id: 'validator-address',
    name: 'validator-address',
    title: 'Validator Address',
    subtitle: 'Address of the validator',
  })

  const dstValidatorState = useInputState({
    id: 'dst-validator-address',
    name: 'dst-validator-address',
    title: 'Destination Validator Address',
    subtitle: 'Address of the destination validator',
  })

  const amountState = useInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount',
    subtitle: 'Amount of tokens for allowance operations',
  })

  const [type, setType] = useState<QueryType>('admins')
  const [executeType, setExecuteType] = useState<QueryType>('send')

  const addressVisible = type === 'allowance' || type === 'permissions' || type === 'can_execute'
  const toAddressVisible = executeType === 'send' || executeType === 'withdraw'
  const validatorVisible = executeType === 'delegate' || executeType === 'undelegate' || executeType === 'redelegate'
  const dstValidatorVisible = executeType === 'redelegate'
  const amountVisible =
    executeType === 'send' || executeType === 'delegate' || executeType === 'undelegate' || executeType === 'redelegate'

  const { data: response } = useQuery(
    [
      address,
      type,
      contract,
      wallet,
      ownerAddress,
      executeType,
      toAddressState,
      validatorState,
      dstValidatorState,
      amountState,
    ] as const,
    async ({ queryKey }) => {
      const [
        _address,
        _type,
        _contract,
        _wallet,
        _ownerAddress,
        _executeType,
        _toAddressState,
        _validatorState,
        _dstValidatorState,
        _amountState,
      ] = queryKey
      const messages = contract?.use(_address)
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const ownerAddress = _ownerAddress || _wallet.address

      const _canExecuteMessage = () => {
        switch (executeType) {
          case 'send':
            return `{"bank": {"send": {"to_address": "${_toAddressState.value}", "amount": [{"amount": "${_amountState.value}", "denom": "ujunox"}]}}}`
            break
          case 'withdraw':
            return `{"distribution": {"set_withdraw_address": {"address": "${_toAddressState.value}"}}}`
            break
          case 'redelegate':
            return `{"staking": {"${_executeType}": {"src_validator": "${_validatorState.value}+'","dst_validator": "${_dstValidatorState.value}","amount": {"amount":"${_amountState.value}", "denom": "ujunox"}}}}`
            break
          default:
            return `{"staking": {"${_executeType}": {"validator": "${_validatorState.value}","amount": {"amount":"${_amountState.value}", "denom": "ujunox"}}}}`
            break
        }
      }
      const result = await dispatchQuery({
        ownerAddress,
        canExecuteMessage: JSON.parse(_canExecuteMessage()),
        messages,
        type,
      })
      return result
    },
    {
      placeholderData: null,
      onError: (error: any) => {
        toast.error(error.message)
      },
      enabled: Boolean(address && type && contract && wallet),
    },
  )

  const router = useRouter()

  useEffect(() => {
    if (address.length > 0) {
      void router.replace({ query: { contractAddress: address } })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address])
  useEffect(() => {
    const initial = new URL(document.URL).searchParams.get('contractAddress')
    if (initial && initial.length > 0) contractState.onChange(initial)
  }, [])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Query CW1 Subkeys Contract" />
      <ContractPageHeader
        description="CW1 Subkeys is a whitelisting contract dealing with Send, Delegate, Undelegate, Redelegate and Withdraw messages."
        link={links['Docs CW1 Subkeys']}
        title="CW1 Subkeys Contract"
      />
      <LinkTabs activeIndex={1} data={cw1SubkeysLinkTabs} />

      <div className="grid grid-cols-2 p-4 space-x-8">
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <FormControl htmlId="contract-query-type" subtitle="Type of query to be dispatched" title="Query Type">
            <select
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-select',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20',
              )}
              id="contract-query-type"
              name="query-type"
              onChange={(e) => setType(e.target.value as QueryType)}
            >
              {QUERY_LIST.map(({ id, name }) => (
                <option key={`query-${id}`} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </FormControl>
          <Conditional test={addressVisible}>
            <AddressInput {...ownerState} />
          </Conditional>
          <Conditional test={type === 'can_execute'}>
            <FormControl htmlId="query-execute-type" subtitle="Type of query to be dispatched" title="Execute Type">
              <select
                className={clsx(
                  'bg-white/10 rounded border-2 border-white/20 form-select',
                  'placeholder:text-white/50',
                  'focus:ring focus:ring-plumbus-20',
                )}
                id="query-execute-type"
                name="query-execute-type"
                onChange={(e) => setExecuteType(e.target.value as QueryType)}
              >
                {QUERY_EXECUTE_LIST.map(({ id, name }) => (
                  <option key={`query-${id}`} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </FormControl>
            <Conditional test={toAddressVisible}>
              <AddressInput {...toAddressState} />
            </Conditional>
            <Conditional test={validatorVisible}>
              <ValidatorAddressInput {...validatorState} />
            </Conditional>
            <Conditional test={dstValidatorVisible}>
              <ValidatorAddressInput {...dstValidatorState} />
            </Conditional>
            <Conditional test={amountVisible}>
              <NumberInput {...amountState} />
            </Conditional>
          </Conditional>
        </div>
        <JsonPreview content={address ? { type, response } : null} title="Query Response" />
      </div>
    </section>
  )
}

export default withMetadata(CW1SubkeysQueryPage, { center: false })
