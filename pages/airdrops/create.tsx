import React, { useState, useRef, useEffect } from 'react'
import WalletLoader from 'components/WalletLoader'
import type { NextPage } from 'next'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { IoCloseSharp } from 'react-icons/io5'
import axios from 'axios'
import Router from 'next/router'
import toast from 'react-hot-toast'
import isValidAirdropFile from 'utils/isValidAirdropFile'

const CreateDrop: NextPage = () => {
  const [loading, setLoading] = useState(false)
  const [airdropFile, setAirdropFile] = useState<File | null>(null)
  const [fileContents, setFileContents] = useState<any>(null)

  const inputFile = useRef<HTMLInputElement>(null)

  const jsonExample = {
    name: '<project-name>',
    accounts: [
      { address: 'junoxxx', amount: 1234 },
      { address: 'junoyyy', amount: 1234 },
    ],
    cw20TokenAddress: '<token-contract-address>',
    start: '<airdrop-start-block-number> OR null',
    expiration: '<airdrop-end-block-number> OR null',
    totalAmount: '<total-airdropped-token-amount>',
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAirdropFile(e.target.files[0])
  }

  const removeFileOnClick = () => {
    setAirdropFile(null)
    setFileContents(null)
    if (inputFile.current) inputFile.current.value = ''
  }

  useEffect(() => {
    if (airdropFile) {
      if (airdropFile.name.slice(-5, airdropFile.name.length) !== '.json') {
        toast.error('Please select a json file!')
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (!e.target?.result) return toast.error('Error parsing file.')
          if (!isValidAirdropFile(JSON.parse(e.target.result.toString())))
            return toast.error(
              'Invalid file. Make sure you have the required fields!'
            )
          setFileContents(JSON.parse(e.target.result.toString()))
        }
        reader.readAsText(airdropFile)
      }
    }
  }, [airdropFile])

  const uploadJSONOnClick = () => {
    if (!airdropFile) {
      if (inputFile.current) inputFile.current.click()
    } else {
      if (!fileContents) return toast.error('Error parsing file.')

      setLoading(true)

      axios
        .post(`${process.env.NEXT_PUBLIC_API_URL}/airdrops`, airdropFile, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((data) => {
          const { airdrop } = data.data
          setLoading(false)
          Router.push({
            pathname: '/airdrops/instantiate',
            query: {
              name: airdrop.name,
              cw20TokenAddress: airdrop.cw20TokenAddress,
              merkleRoot: airdrop.merkleRoot,
              start: airdrop.start,
              expiration: airdrop.expiration,
              totalAmount: airdrop.totalAmount,
              id: airdrop._id,
            },
          })
        })
        .catch((err: any) => {
          setLoading(false)
          toast.error(err.message, { style: { maxWidth: 'none' } })
        })
    }
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold mb-4">Create Drop</h1>
      <div className="text-xl mb-2">
        Here is the json{' '}
        {fileContents ? (
          <span>file you selected with the first few lines</span>
        ) : (
          <span>format you need to upload for drop registration</span>
        )}
      </div>

      <SyntaxHighlighter language="javascript" style={prism}>
        {`${JSON.stringify(
          fileContents
            ? {
                ...fileContents,
                accounts: fileContents.accounts.slice(0, 5),
              }
            : jsonExample,
          null,
          2
        )}${fileContents ? '...and more' : ''}`}
      </SyntaxHighlighter>
      {airdropFile && (
        <div className="font-bold flex justify-center items-center">
          Selected file name: {airdropFile.name}{' '}
          <IoCloseSharp
            onClick={removeFileOnClick}
            className="ml-1 w-5 h-5 cursor-pointer"
          />
        </div>
      )}
      <input
        type="file"
        id="file"
        ref={inputFile}
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <button
        className={`btn btn-primary btn-lg font-semibold hover:text-base-100 text-2xl w-full mt-2 ${
          loading ? 'loading' : ''
        }`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={uploadJSONOnClick}
      >
        {!!airdropFile ? 'Create Drop' : 'Select JSON file'}
      </button>
      <br />
    </div>
  )
}

export default CreateDrop
