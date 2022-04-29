import { FormControl } from 'components/FormControl'
import { Input } from 'components/Input'
import type { ComponentPropsWithRef } from 'react'
import { forwardRef } from 'react'

interface BaseProps {
  id: string
  name: string
  title: string
  subtitle?: string
}

type SlicedInputProps = Omit<ComponentPropsWithRef<'input'>, keyof BaseProps>

export type AddressInputProps = BaseProps & SlicedInputProps

export const AddressInput = forwardRef<HTMLInputElement, AddressInputProps>(
  function AddressInput(props, ref) {
    const { id, name, title, subtitle, ...rest } = props
    return (
      <FormControl htmlId={id} subtitle={subtitle} title={title}>
        <Input
          id={id}
          name={name}
          placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
          ref={ref}
          type="text"
          {...rest}
        />
      </FormControl>
    )
  },
  //
)
