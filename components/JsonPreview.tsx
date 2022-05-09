import { useState } from 'react'
import { FaChevronDown, FaRegClipboard, FaTimes } from 'react-icons/fa'
import { copy } from 'utils/clipboard'

import { Tooltip } from './Tooltip'

export interface JsonPreviewProps {
  title?: string
  content: unknown

  initialState?: boolean
  onClose?: () => void
  isCopyable?: boolean
  isToggleable?: boolean

  /** @deprecated use {@link isCopyable} prop */
  copyable?: boolean
  /** @deprecated use {@link initialState} prop */
  isVisible?: boolean
}

export const JsonPreview = ({
  copyable = false,
  isVisible = true,

  title = 'JSON Preview',
  content,

  initialState = isVisible,
  onClose,
  isCopyable = copyable,
  isToggleable = true,
}: JsonPreviewProps) => {
  const [show, setShow] = useState(() => initialState)

  const toggle = () => {
    if (isToggleable) setShow((prev) => !prev)
  }

  return (
    <div className="relative bg-stone-800/80 rounded border-2 border-white/20 divide-y-2 divide-white/20">
      <div className="flex items-center py-1 px-2 space-x-2">
        <span className="text-sm font-bold">{title}</span>
        <div className="flex-grow" />
        {isToggleable && (
          <Tooltip label={show ? 'Hide content' : 'Show content'}>
            <button onClick={toggle} type="button">
              <FaChevronDown className={show ? 'rotate-180' : ''} size={16} />
            </button>
          </Tooltip>
        )}
        {isCopyable && (
          <Tooltip label="Copy to clipboard">
            <button onClick={() => void copy(JSON.stringify(content))} type="button">
              <FaRegClipboard size={16} />
            </button>
          </Tooltip>
        )}
        {onClose && (
          <Tooltip label="Close">
            <button className="text-plumbus" onClick={onClose} type="button">
              <FaTimes size={20} />
            </button>
          </Tooltip>
        )}
      </div>
      {show && (
        <div className="overflow-auto p-2 font-mono text-sm">
          <pre>{JSON.stringify(content, null, 2).trim()}</pre>
        </div>
      )}
    </div>
  )
}
