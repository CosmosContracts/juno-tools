import React, { useState, useRef, useEffect } from 'react'
import type { NextPage } from 'next'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { IoCloseSharp } from 'react-icons/io5'
import axios from 'axios'
import Router from 'next/router'
import toast from 'react-hot-toast'
import isValidAirdropFile from 'utils/isValidAirdropFile'
import {
  MAINNET_CW20_MERKLE_DROP_CODE_ID,
  TESTNET_CW20_MERKLE_DROP_CODE_ID,
} from 'utils/constants'
import { useWallet } from 'contexts/wallet'
import { uploadObject } from 'services/s3'
import { useContracts } from 'contexts/contracts'
import { toAscii, fromAscii } from '@cosmjs/encoding'
import { compare } from 'compare-versions'

const CreateAirdrop: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

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
    start:
      '<airdrop-start-block-number> OR <unix-timestamp-in-seconds> OR null',
    startType: '<height OR timestamp> OR null',
    expiration:
      '<airdrop-end-block-number> OR <unix-timestamp-in-seconds> OR null',
    expirationType: '<height OR timestamp> OR null',
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
            return
          setFileContents(JSON.parse(e.target.result.toString()))
        }
        reader.readAsText(airdropFile)
      }
    }
  }, [airdropFile])

  const isCW20TokenValid = async (cw20TokenAddress: string) => {
    const client = wallet.getClient()
    const res = await client.queryContractRaw(
      cw20TokenAddress,
      toAscii('contract_info')
    )
    if (res) {
      const contractInfo = JSON.parse(fromAscii(res))
      if (compare(contractInfo.version, '0.11.1', '<'))
        throw new Error(
          'Invalid cw20 contract version\nMust be 0.11.1 or higher'
        )
    } else throw new Error('Could not get cw20 contract info')
    if (!contract) return toast.error('Smart contract connection failed')
    await contract?.use(cw20TokenAddress)?.tokenInfo()
  }

  const uploadJSONOnClick = async () => {
    try {
      if (!wallet.initialized) return toast.error('Please connect your wallet!')

      if (!airdropFile) {
        if (inputFile.current) inputFile.current.click()
      } else {
        if (!fileContents) return toast.error('Error parsing file.')

        setLoading(true)

        toast('Validating your cw20 token address')
        await isCW20TokenValid(fileContents.cw20TokenAddress)

        const client = wallet.getClient()

        const contractAddress = await instantiate()

        const stage = await client.queryContractSmart(contractAddress, {
          latest_stage: {},
        })
        toast('Uploading your airdrop file')
        await uploadObject(
          `${contractAddress}-${stage.latest_stage}.json`,
          JSON.stringify({
            ...fileContents,
            contractAddress,
            stage: stage.latest_stage,
          })
        )

        toast('Prepearing your airdrop for processing')
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops`,
          { contractAddress, stage: stage.latest_stage },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        setLoading(false)
        Router.push({
          pathname: '/airdrops/register',
          query: {
            contractAddress,
          },
        })
      }
    } catch (err: any) {
      setLoading(false)
      toast.error(err.message, { style: { maxWidth: 'none' } })
    }
  }

  const instantiate = async () => {
    if (!wallet.initialized) return toast.error('Please connect your wallet!')

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
      wallet.network === 'mainnet'
        ? MAINNET_CW20_MERKLE_DROP_CODE_ID
        : TESTNET_CW20_MERKLE_DROP_CODE_ID,
      msg,
      fileContents.name,
      'auto'
    )

    return response.contractAddress
  }

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold mb-4 text-center">Create Airdrop</h1>
      <div className="text-xl mb-2 text-center">
        Here is the json{' '}
        {fileContents ? (
          <span>file you selected with the first few lines</span>
        ) : (
          <span>format you need to upload for airdrop creation</span>
        )}
      </div>

      <SyntaxHighlighter
        language="javascript"
        style={prism}
        customStyle={{ maxHeight: 450, height: 450 }}
      >
        {JSON.stringify(
          fileContents
            ? {
                ...fileContents,
                accounts: fileContents.accounts.slice(0, 3),
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
        className={`btn bg-juno border-0 btn-lg font-semibold hover:bg-juno/80 text-2xl w-full mt-2 ${
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
