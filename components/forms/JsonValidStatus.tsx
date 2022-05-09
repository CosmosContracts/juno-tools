import clsx from 'clsx'
import type { RefObject } from 'react'
import { useEffect, useState } from 'react'
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa'
import { parseJson } from 'utils/json'

export interface JsonValidStatusProps {
  textAreaRef: RefObject<HTMLTextAreaElement>
}

export function JsonValidStatus({ textAreaRef }: JsonValidStatusProps) {
  const [valid, setValid] = useState<boolean | null>(null)
  const ValidIcon = valid ? FaCheckCircle : FaTimesCircle

  useEffect(() => {
    const listen = () => {
      if (!textAreaRef.current) return
      try {
        if (textAreaRef.current.value.length > 0) {
          parseJson(textAreaRef.current.value)
          setValid(true)
        } else {
          setValid(null)
        }
      } catch {
        setValid(false)
      }
    }
    listen()
    textAreaRef.current?.addEventListener('input', listen)
    return () => textAreaRef.current?.removeEventListener('input', listen)
  })

  if (valid === null) return null

  return (
    <div
      className={clsx('flex items-center space-x-1 text-sm', {
        'text-green-500': valid,
        'text-red-500': !valid,
      })}
    >
      <ValidIcon />
      <span>{valid ? 'valid json content' : 'invalid json content'}</span>
    </div>
  )
}
