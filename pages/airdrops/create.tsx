import React, { useState, useRef, useEffect } from 'react'
import type { NextPage } from 'next'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { IoCloseSharp } from 'react-icons/io5'
import axios from 'axios'
import Router from 'next/router'
import toast from 'react-hot-toast'
import isValidAirdropFile from 'utils/isValidAirdropFile'
import { CW20_MERKLE_DROP_CODE_ID } from 'utils/constants'
import { useWallet } from 'contexts/wallet'

const CreateAirdrop: NextPage = () => {
  const wallet = useWallet()

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
    start: '<airdrop-start-block-number> OR <unix-timestamp> OR null',
    expiration: '<airdrop-end-block-number> OR <unix-timestamp> OR null',
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

  const uploadJSONOnClick = async () => {
    if (!airdropFile) {
      if (inputFile.current) inputFile.current.click()
    } else {
      if (!fileContents) return toast.error('Error parsing file.')

      setLoading(true)

      instantiate()
        .then((contractAddress) => {
          axios
            .post(
              `${process.env.NEXT_PUBLIC_API_URL}/airdrops`,
              { ...fileContents, contractAddress },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
            .then(() => {
              setLoading(false)
              Router.push({
                pathname: '/airdrops/register',
                query: {
                  contractAddress,
                },
              })
            })
        })
        .catch((err: any) => {
          setLoading(false)
          toast.error(err.message)
        })
        .catch((err: any) => {
          setLoading(false)
          toast.error(err.message, { style: { maxWidth: 'none' } })
        })
    }
  }

  const instantiate = async () => {
    const client = wallet.getClient()

    const msg = {
      owner: wallet.address,
      cw20_token_address: fileContents.cw20TokenAddress,
    }

    if (!client) {
      setLoading(false)
      return toast.error('Please try reconnecting your wallet.', {
        style: { maxWidth: 'none' },
      })
    }

    const response = await client.instantiate(
      wallet.address,
      CW20_MERKLE_DROP_CODE_ID,
      msg,
      fileContents.name,
      'auto'
    )

    return response.contractAddress
  }

  return (
    <div className="container mx-auto max-w-lg">
      <h1 className="text-6xl font-bold mb-4">Create Airdrop</h1>
      <div className="text-xl mb-2">
        Here is the json{' '}
        {fileContents ? (
          <span>file you selected with the first few lines</span>
        ) : (
          <span>format you need to upload for airdrop creation</span>
        )}
      </div>

      <SyntaxHighlighter language="javascript" style={prism}>
        {JSON.stringify(
          fileContents
            ? {
                ...fileContents,
                accounts: fileContents.accounts.slice(0, 5),
              }
            : jsonExample,
          null,
          2
        )}
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
        {!!airdropFile ? 'Create Airdrop' : 'Select JSON file'}
      </button>
      <br />
    </div>
  )
}

export default CreateAirdrop
