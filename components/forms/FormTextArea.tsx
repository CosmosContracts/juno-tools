import clsx from 'clsx'
import { FormControl } from 'components/FormControl'
import type { ComponentPropsWithRef } from 'react'
import { forwardRef, useImperativeHandle, useRef } from 'react'

import { JsonValidStatus } from './JsonValidStatus'
import { StyledTextArea } from './StyledTextArea'

interface BaseProps {
  id: string
  name: string
  title: string
  subtitle?: string
}

type SlicedInputProps = Omit<ComponentPropsWithRef<'textarea'>, keyof BaseProps>

export type FormTextAreaProps = BaseProps & SlicedInputProps

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  function FormTextArea(props, ref) {
    const { id, name, title, subtitle, ...rest } = props

    return (
      <FormControl htmlId={id} subtitle={subtitle} title={title}>
        <StyledTextArea id={id} name={name} ref={ref} {...rest} />
      </FormControl>
    )
  },
  //
)

export const JsonTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  function JsonTextArea(props, ref) {
    const { id, name, title, subtitle, className, ...rest } = props

    const innerRef = useRef<HTMLTextAreaElement>(null)
    useImperativeHandle(ref, () => innerRef.current!)

    return (
      <FormControl htmlId={id} subtitle={subtitle} title={title}>
        <StyledTextArea
          className={clsx('min-h-[8rem] font-mono text-sm', className)}
          id={id}
          name={name}
          ref={innerRef}
          {...rest}
        />
        <JsonValidStatus textAreaRef={innerRef} />
      </FormControl>
    )
  },
  //
)
