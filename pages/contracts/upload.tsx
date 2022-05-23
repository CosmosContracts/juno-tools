import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { JsonPreview } from 'components/JsonPreview'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

const UploadContract: NextPage = () => {
  const { getClient, address } = useWallet()

  const [loading, setLoading] = useState(false)
  const [transactionResult, setTransactionResult] = useState<any>()
  const [wasmFile, setWasmFile] = useState<File | null>(null)
  const [wasmByteArray, setWasmByteArray] = useState<Uint8Array | null>(null)

  const inputFile = useRef<HTMLInputElement>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setWasmFile(e.target.files[0])
  }

  useEffect(() => {
    if (wasmFile) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (!e.target?.result) return toast.error('Error parsing file.')
          const byteArray = new Uint8Array(e.target.result as ArrayBuffer)
          setWasmByteArray(byteArray)
        } catch (error: any) {
          toast.error(error.message)
        }
      }
      reader.readAsArrayBuffer(wasmFile)
    }
  }, [wasmFile])

  const upload = async () => {
    try {
      if (!wasmFile || !wasmByteArray) return toast.error('No file selected.')

      setLoading(true)

      const client = getClient()

      const result = await client.upload(address, wasmByteArray, 'auto')

      setTransactionResult({
        transactionHash: result.transactionHash,
        codeId: result.codeId,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        originalChecksum: result.originalChecksum,
        compressedChecksum: result.compressedChecksum,
      })

      setLoading(false)
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Upload Contract" />
      <ContractPageHeader
        description="Here you can upload a contract on Juno Network."
        link=""
        title="Upload Contract"
      />
      <div className="inset-x-0 bottom-0 border-b-2 border-white/25" />

      <Conditional test={Boolean(transactionResult)}>
        <Alert type="info">
          <b>Upload success!</b> Here is the transaction result containing the code ID, transaction hash and other data.
        </Alert>
        <JsonPreview content={transactionResult} title="Transaction Result" />
        <br />
      </Conditional>

      <div
        className={clsx(
          'flex relative justify-center items-center space-y-4 h-32',
          'rounded border-2 border-white/20 border-dashed',
        )}
      >
        <input
          accept=".wasm"
          className={clsx(
            'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
            'before:absolute before:inset-0 before:hover:bg-white/5 before:transition',
          )}
          onChange={onFileChange}
          ref={inputFile}
          type="file"
        />
      </div>

      <div className="flex justify-end pb-6">
        <Button isDisabled={!wasmFile} isLoading={loading} isWide leftIcon={<FaAsterisk />} onClick={upload}>
          Upload Contract
        </Button>
      </div>
    </section>
  )
}

export default withMetadata(UploadContract, { center: false })
