import { IoCloseSharp, IoCopyOutline } from 'react-icons/io5'
import { copy } from 'utils/clipboard'

export interface JsonPreviewProps {
  title: string
  content: unknown
  onClose?: () => void
  copyable?: boolean
}

const JsonPreview = (props: JsonPreviewProps) => {
  const { title, content, onClose, copyable } = props

  return (
    <div className="flex flex-col bg-stone-800/80 rounded border-2 border-white/20">
      <div className="flex justify-center py-2 px-4 space-x-2 border-b-2 border-white/20">
        <span className="font-mono">{title}</span>
        {onClose && (
          <button
            className="flex items-center text-plumbus hover:text-plumbus-light rounded-full"
            onClick={onClose}
          >
            <IoCloseSharp size={22} />
          </button>
        )}
        {copyable && (
          <button
            className="flex items-center text-plumbus hover:text-plumbus-light rounded-full"
            onClick={() => copy(JSON.stringify(content))}
          >
            <IoCopyOutline size={22} />
          </button>
        )}
      </div>
      <div className="overflow-auto p-2 font-mono text-sm hover:resize-y">
        <pre>{JSON.stringify(content, null, 2).trim()}</pre>
      </div>
    </div>
  )
}

export default JsonPreview
