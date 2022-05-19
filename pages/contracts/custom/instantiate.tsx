import clsx from 'clsx'
import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { ContractPageHeader } from 'components/ContractPageHeader'
import { NumberInput, TextInput } from 'components/forms/FormInput'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { customLinkTabs } from 'components/LinkTabs.data'
import { useWallet } from 'contexts/wallet'
import { isArray } from 'lodash-es'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { parse as parseSchema } from 'utils/contractSchemaParser'
import { withMetadata } from 'utils/layout'

interface ParsedSchema {
  field: string
  type: string
  data: any
}

const InstantiateContract: NextPage = () => {
  const { address, getClient } = useWallet()

  const inputFile = useRef<HTMLInputElement>(null)

  const [schemaFile, setSchemaFile] = useState<File | null>(null)
  const [schemaData, setSchemaData] = useState<any>(null)
  const [inputValues, setInputValues] = useState<any>({})

  console.log(inputValues)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setSchemaFile(e.target.files[0])
  }

  useEffect(() => {
    if (schemaFile) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          if (!e.target?.result) return toast.error('Error parsing file.')
          const data = await parseSchema(JSON.parse(e.target.result as string))
          setSchemaData(data)
        } catch (error: any) {
          toast.error(error.message)
        }
      }
      reader.readAsText(schemaFile)
    }
  }, [schemaFile])

  const handleTextForms = ({ target: { name, value } }: any) => {
    setInputValues({
      ...inputValues,
      [name]: value,
    })
  }

  const makeInstantiateForms = (schema: ParsedSchema[], subtitle?: string, isRequired = true): any => {
    return schema.map((item: ParsedSchema) => {
      const title = item.field.split('_').join(' ')
      switch (item.type) {
        case 'string':
          return (
            <div className="my-3">
              <TextInput
                id={item.field}
                isRequired={isRequired}
                name={item.field}
                onChange={handleTextForms}
                subtitle={subtitle && `${subtitle} / ${title}`}
                title={title}
              />
            </div>
          )
        case 'integer':
          return (
            <div className="my-3">
              <NumberInput
                id={item.field}
                isRequired={isRequired}
                name={item.field}
                onChange={handleTextForms}
                subtitle={subtitle && `${subtitle} / ${title}`}
                title={title}
              />
            </div>
          )
        case 'optional':
          return isArray(item.data) ? (
            makeInstantiateForms(item.data, title, false)
          ) : (
            <div className="my-3">
              <TextInput
                id={item.field}
                name={item.field}
                onChange={handleTextForms}
                subtitle={subtitle && `${subtitle} / ${title}`}
                title={title}
              />
            </div>
          )
        case 'struct':
          return makeInstantiateForms(item.data, subtitle ? `${subtitle} / ${title}` : title)
        default:
          return null
      }
    })
  }

  const instantiate = () => {
    const client = getClient()

    // const result = await client.instantiate(address, )
  }

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Custom Contract" />
      <ContractPageHeader
        description="Here you can work on your custom contract with auto generated UI elements."
        link=""
        title="Custom Contract"
      />
      <Alert type="warning">
        This is a feature still in beta. Please contribute by reporting any issues you come across.
      </Alert>
      <LinkTabs activeIndex={0} data={customLinkTabs} />

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

      <Conditional test={Boolean(schemaData)}>
        <JsonPreview content={schemaData} initialState={false} />

        <NumberInput
          id="contractCodeId"
          name="contractCodeId"
          onChange={handleTextForms}
          subtitle="Code ID of your uploaded contract"
          title="Code ID"
        />
        <div className="capitalize">{schemaData && makeInstantiateForms(schemaData)}</div>
      </Conditional>

      <div className="flex sticky right-0 bottom-0 justify-end pb-6">
        <Button isDisabled={!schemaData} isWide leftIcon={<FaAsterisk />} onClick={instantiate}>
          Instantiate
        </Button>
      </div>
    </section>
  )
}

export default withMetadata(InstantiateContract, { center: false })
