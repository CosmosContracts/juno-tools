import { Button } from 'components/Button'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { ExecutableCombobox } from 'components/contracts/cw1/subkeys/ExecutableCombobox'
import { ExecuteCombobox } from 'components/contracts/cw1/subkeys/ExecuteCombobox'
import { useExecuteComboboxState } from 'components/contracts/cw1/subkeys/ExecuteCombobox.hooks'
import { FormControl } from 'components/FormControl'
import { AddressList } from 'components/forms/AddressList'
import { useAddressListState } from 'components/forms/AddressList.hooks'
import { AddressInput, NumberInput, TextInput } from 'components/forms/FormInput'
import { useInputState, useNumberInputState } from 'components/forms/FormInput.hooks'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw1SubkeysLinkTabs } from 'components/LinkTabs.data'
import { Radio } from 'components/Radio'
import { TransactionHash } from 'components/TransactionHash'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { Permissions } from 'contracts/cw1/subkeys'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FaArrowRight } from 'react-icons/fa'
import { useMutation } from 'react-query'
import type { DispatchExecuteArgs } from 'utils/contracts/cw1/subkeys/execute'
import {
  dispatchExecute,
  isEitherExecuteType,
  isEitherType,
  previewExecutePayload,
} from 'utils/contracts/cw1/subkeys/execute'
import { parseJson } from 'utils/json'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const PERMISSION_RADIO_VALUES = [
  {
    id: 'delegate',
    title: 'Delegate',
    subtitle: `Give recipient the ability to delegate tokens based on their allowance`,
  },
  {
    id: 'undelegate',
    title: 'Undelegate',
    subtitle: `Give recipient the ability to undelegate tokens if they have delegated them`,
  },
  {
    id: 'redelegate',
    title: 'Reelegate',
    subtitle: `Give recipient the ability to redelegate tokens if they have delegated them`,
  },
  {
    id: 'withdraw',
    title: 'Withdraw',
    subtitle: `Give recipient the ability to withdraw tokens`,
  },
]

type PermissionValue = 'delegate' | 'undelegate' | 'redelegate' | 'withdraw'

const CW1SubkeysExecutePage: NextPage = () => {
  const { cw1Subkeys: contract } = useContracts()
  const wallet = useWallet()
  const [lastTx, setLastTx] = useState('')

  const addressListState = useAddressListState()

  const comboboxState = useExecuteComboboxState()
  const type = comboboxState.value?.id

  const exeComboboxState = useExecuteComboboxState()
  const executeType = exeComboboxState.value?.id

  const [permissions, setPermissions] = useState<Permissions>({
    delegate: false,
    undelegate: false,
    redelegate: false,
    withdraw: false,
  })

  const amountState = useNumberInputState({
    id: 'amount',
    name: 'amount',
    title: 'Amount',
    subtitle: 'Amount of tokens for allowance operations',
  })

  const contractState = useInputState({
    id: 'contract-address',
    name: 'contract-address',
    title: 'CW1 Subkeys Address',
    subtitle: 'Address of the CW1 Subkeys contract',
  })

  const recipientState = useInputState({
    id: 'recipient-address',
    name: 'recipient',
    title: 'Recipient Address',
    subtitle: 'Address of the recipient',
  })

  const validatorState = useInputState({
    id: 'validator-address',
    name: 'validator',
    title: 'Validator Address',
    subtitle: 'Address of the validator',
  })

  const dstValidatorState = useInputState({
    id: 'validator-address',
    name: 'validator',
    title: 'Validator Address',
    subtitle: 'Address of the dsc validator',
  })

  const denomState = useInputState({
    id: 'denom',
    name: 'denom',
    title: 'Denom',
    subtitle: 'Address of the recipient',
  })

  const showAmountField =
    (type && isEitherType(type, ['increase_allowance', 'decrease_allowance'])) ||
    isEitherExecuteType(executeType, ['send', 'delegate', 'undelegate', 'redelegate'])
  const showMessageField = isEitherType(type, ['execute'])
  const showRecipientField =
    isEitherType(type, ['increase_allowance', 'decrease_allowance', 'set_permissions']) ||
    isEitherExecuteType(executeType, ['send'])
  const showAdminsField = type === 'update_admins'
  const showPermissionField = type === 'set_permissions'
  const showDenomField =
    isEitherType(type, ['execute']) &&
    isEitherExecuteType(executeType, ['send', 'delegate', 'undelegate', 'redelegate'])
  const showValidatorField =
    isEitherType(type, ['execute']) &&
    isEitherExecuteType(executeType, ['withdraw', 'delegate', 'undelegate', 'redelegate'])
  const showDstValidatorField = isEitherType(type, ['execute']) && isEitherExecuteType(executeType, ['redelegate'])

  const messageState = () => {
    if (isEitherExecuteType(executeType, ['send'])) {
      return `{"bank": {"send": {"to_address": "${recipientState.value}", "amount": [{"amount": "${amountState.value}", "denom": "${denomState.value}"}]}}}`
    } else if (isEitherExecuteType(executeType, ['withdraw'])) {
      return `{"distribution": {"set_withdraw_address": {"address": "${validatorState.value}"}}}`
    } else if (isEitherExecuteType(executeType, ['redelegate'])) {
      return `{"staking": {"redelegate": {"src_validator": "${validatorState.value}","dst_validator": "${dstValidatorState.value}","amount": {"amount":"${amountState.value}", "denom": "${denomState.value}"}}}}`
    } else if (isEitherExecuteType(executeType, ['delegate'])) {
      return `{"staking": {"delegate": {"validator": "${validatorState.value}","amount": {"amount":"${amountState.value}", "denom": "${denomState.value}"}}}}`
    }
    return `{"staking": {"undelegate": {"validator": "${validatorState.value}","amount": {"amount":"${amountState.value}", "denom": "${denomState.value}"}}}}`
  }

  const messages = useMemo(() => contract?.use(contractState.value), [contract, wallet.address, contractState.value])
  const payload: DispatchExecuteArgs = {
    amount: amountState.value.toString(),
    contract: contractState.value,
    messages,
    msgs: [parseJson(messageState())],
    recipient: recipientState.value,
    txSigner: wallet.address,
    type,
    admins: addressListState.values.map((item) => item.address),
    permissions,
  }

  const permissionsOnChange = (value: PermissionValue) => {
    setPermissions({ ...permissions, [value]: !permissions[value] })
  }

  const { isLoading, mutate } = useMutation(
    async (event: FormEvent) => {
      event.preventDefault()
      if (!type) {
        throw new Error('Please select message type!')
      }
      const txHash = await toast.promise(dispatchExecute(payload), {
        error: `${type.charAt(0).toUpperCase() + type.slice(1)} execute failed!`,
        loading: 'Executing message...',
        success: (tx) => `Transaction ${tx} success!`,
      })
      if (txHash) {
        setLastTx(txHash)
      }
    },
    {
      onError: (error) => {
        console.error(error)
        toast.error(String(error))
      },
    },
  )

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Execute CW1 Subkeys Contract" />
      <ContractPageHeader
        description="CW1 Subkeys is a whitelisting contract dealing with Send, Delegate, Undelegate, Redelegate and Withdraw messages."
        link={links['Docs CW1 Subkeys']}
        title="CW1 Subkeys Contract"
      />
      <LinkTabs activeIndex={2} data={cw1SubkeysLinkTabs} />

      <form className="grid grid-cols-2 p-4 space-x-8" onSubmit={mutate}>
        <div className="space-y-8">
          <AddressInput {...contractState} />
          <ExecuteCombobox {...comboboxState} />
          {showAdminsField && (
            <AddressList
              entries={addressListState.entries}
              onAdd={addressListState.add}
              onChange={addressListState.update}
              onRemove={addressListState.remove}
              subtitle="Enter the new admins you want in your contract. This will replace the old admins"
              title="Admins"
            />
          )}
          {showMessageField && <ExecutableCombobox {...exeComboboxState} />}
          {showRecipientField && <AddressInput {...recipientState} />}
          {showValidatorField && <AddressInput {...validatorState} />}
          {showDstValidatorField && <AddressInput {...dstValidatorState} />}
          {showDenomField && <TextInput {...denomState} />}
          {showAmountField && <NumberInput {...amountState} />}
          {showPermissionField && (
            <FormControl subtitle="Select the permission you want to give to recipient address" title="Permissions">
              <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
                {PERMISSION_RADIO_VALUES.map(({ id, title, subtitle }) => (
                  <Radio
                    key={`mutable-${id}`}
                    checked={permissions[id as PermissionValue]}
                    htmlFor="mutable"
                    id={id}
                    onChange={() => permissionsOnChange(id as PermissionValue)}
                    selectSingle
                    subtitle={subtitle}
                    title={title}
                  />
                ))}
              </fieldset>
            </FormControl>
          )}
        </div>
        <div className="space-y-8">
          <div className="relative">
            <Button className="absolute top-0 right-0" isLoading={isLoading} rightIcon={<FaArrowRight />} type="submit">
              Execute
            </Button>
            <FormControl subtitle="View execution transaction hash" title="Transaction Hash">
              <TransactionHash hash={lastTx} />
            </FormControl>
          </div>
          <FormControl subtitle="View current message to be sent" title="Payload Preview">
            <JsonPreview content={previewExecutePayload(payload)} isCopyable />
          </FormControl>
        </div>
      </form>
    </section>
  )
}

export default withMetadata(CW1SubkeysExecutePage, { center: false })
