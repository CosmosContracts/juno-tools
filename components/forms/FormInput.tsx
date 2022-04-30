import { FormControl } from 'components/FormControl'
import { StyledInput } from 'components/Input'
import type { ComponentPropsWithRef } from 'react'
import { forwardRef } from 'react'

interface BaseProps {
  id: string
  name: string
  title: string
  subtitle?: string
}

type SlicedInputProps = Omit<ComponentPropsWithRef<'input'>, keyof BaseProps>

export type FormInputProps = BaseProps & SlicedInputProps

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  function FormInput(props, ref) {
    const { id, name, title, subtitle, ...rest } = props
    return (
      <FormControl htmlId={id} subtitle={subtitle} title={title}>
        <StyledInput id={id} name={name} ref={ref} {...rest} />
      </FormControl>
    )
  },
  //
)

export const AddressInput = forwardRef<HTMLInputElement, FormInputProps>(
  function AddressInput(props, ref) {
    return <FormInput {...props} placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..." ref={ref} type="text" />
  },
  //
)

export const NumberInput = forwardRef<HTMLInputElement, FormInputProps>(
  function NumberInput(props, ref) {
    return <FormInput {...props} ref={ref} type="number" />
  },
  //
)

export const TextInput = forwardRef<HTMLInputElement, FormInputProps>(
  function TextInput(props, ref) {
    return <FormInput {...props} ref={ref} type="text" />
  },
  //
)
