import clsx from 'clsx'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { JsonPreview } from 'components/JsonPreview'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { withMetadata } from 'utils/layout'

const UploadContract: NextPage = () => {
  const [schemaFile, setSchemaFile] = useState<File | null>(null)

  const inputFile = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState<any>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    console.log(e.target.files)
    setSchemaFile(e.target.files[0])
  }

  useEffect(() => {
    if (schemaFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (!e.target?.result) return toast.error('Error parsing file.')
          setContent(JSON.parse(e.target.result as string))
        } catch (error: any) {
          toast.error(error.message)
        }
      }
      reader.readAsText(schemaFile)
    }
  }, [schemaFile])

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Custom Contract" />
      <ContractPageHeader
        description="Here you can work on your custom contract with auto generated UI elements."
        link=""
        title="Custom Contract"
      />
      <div className="inset-x-0 bottom-0 border-b-2 border-white/25" />

      <div
        className={clsx(
          'flex relative justify-center items-center space-y-4 h-32',
          'rounded border-2 border-white/20 border-dashed',
        )}
      >
        <input
          accept=".json"
          className={clsx(
            'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
            'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
          )}
          onChange={onFileChange}
          ref={inputFile}
          type="file"
        />
      </div>

      <JsonPreview content={content} />
    </section>
  )
}

export default withMetadata(UploadContract, { center: false })
