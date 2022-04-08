import clsx from 'clsx'
import BrandColorPicker, { BrandColor } from 'components/BrandColorPicker'
import { ComponentType, SVGProps, useState } from 'react'
import { FaDownload } from 'react-icons/fa'

export interface BrandPreviewProps {
  name: string
  id?: string
  url?: string
  Asset: ComponentType<SVGProps<SVGSVGElement>>
}

const BrandPreview = ({ name, id, url, Asset }: BrandPreviewProps) => {
  const [color, setColor] = useState<BrandColor>('plumbus')

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center space-x-4">
        <a
          href={`#${id}`}
          className="text-2xl font-bold hover:underline"
          id={id}
        >
          {name}
        </a>
        {url && (
          <a
            href={`/${url}`}
            className={clsx(
              'flex items-center py-2 px-4 space-x-2 bg-plumbus-60 rounded',
              'hover:bg-plumbus-70 transition hover:translate-y-[-2px]'
            )}
            download
          >
            <FaDownload />
            <span className="font-bold">Download SVG</span>
          </a>
        )}
      </div>
      <div className="flex flex-col justify-center items-center p-16 max-h-[400px] bg-black/20 rounded">
        <Asset
          className={clsx('transition', {
            'text-plumbus': color == 'plumbus',
            'text-black': color == 'black',
            'text-white': color == 'white',
          })}
        />
      </div>
      <div className="flex justify-end">
        <BrandColorPicker onChange={setColor} />
      </div>
      <br />
    </div>
  )
}

export default BrandPreview
