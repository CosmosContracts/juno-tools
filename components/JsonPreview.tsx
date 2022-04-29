import clsx from 'clsx'
import { useState } from 'react'
import { IoCloseSharp, IoCopyOutline } from 'react-icons/io5'
import { copy } from 'utils/clipboard'

export interface JsonPreviewProps {
  title: string
  content: unknown
  onClose?: () => void
  copyable?: boolean
  isVisible?: boolean
}

export const JsonPreview = (props: JsonPreviewProps) => {
  const { title, content, onClose, copyable, isVisible = true } = props

  const [visible, setVisible] = useState(isVisible)

  const showHideCode = () => {
    setVisible(!visible)
  }

  return (
    <div className="flex flex-col bg-stone-800/80 rounded border-2 border-white/20">
      <div className="flex justify-center py-2 px-4 space-x-2 border-b-2 border-white/20 cursor-pointer">
        <button className="font-mono" onClick={showHideCode} type="button">
          {title}
        </button>
        {onClose && (
          <button
            className="flex items-center text-plumbus hover:text-plumbus-light rounded-full"
            onClick={onClose}
            type="button"
          >
            <IoCloseSharp size={22} />
          </button>
        )}
        {copyable && visible && (
          <button
            className="flex items-center text-plumbus hover:text-plumbus-light rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              void copy(JSON.stringify(content))
            }}
            type="button"
          >
            <IoCopyOutline size={22} />
          </button>
        )}
      </div>
      <div
        className={clsx('overflow-auto p-2 font-mono text-sm hover:resize-y', {
          hidden: !visible,
        })}
      >
        <pre>{JSON.stringify(content, null, 2).trim()}</pre>
      </div>
    </div>
  )
}
