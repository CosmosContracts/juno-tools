import 'react-datepicker/dist/react-datepicker.css'

import { fromAscii, toAscii } from '@cosmjs/encoding'
import axios from 'axios'
import { compare } from 'compare-versions'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Router from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import toast from 'react-hot-toast'
import { IoCloseSharp } from 'react-icons/io5'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { uploadObject } from 'services/s3'
import {
  MAINNET_CW20_MERKLE_DROP_CODE_ID,
  TESTNET_CW20_MERKLE_DROP_CODE_ID,
} from 'utils/constants'
import csvToArray from 'utils/csvToArray'
import { AccountProps, isValidAccountsFile } from 'utils/isValidAccountsFile'

const CreateAirdrop: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

  const [loading, setLoading] = useState(false)
  const [accountsFile, setAccountsFile] = useState<File | null>(null)
  const [fileContents, setFileContents] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [cw20TokenAddress, setCW20TokenAddress] = useState('')
  const [start, setStart] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [startType, setStartType] = useState('height')
  const [expiration, setExpiration] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [expirationType, setExpirationType] = useState('height')

  const inputFile = useRef<HTMLInputElement>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setAccountsFile(e.target.files[0])
  }

  const removeFileOnClick = () => {
    setAccountsFile(null)
    setFileContents(null)
    if (inputFile.current) inputFile.current.value = ''
  }

  useEffect(() => {
    if (accountsFile) {
      if (accountsFile.name.slice(-4, accountsFile.name.length) !== '.csv') {
        toast.error('Please select a csv file!')
      } else {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (!e.target?.result) return toast.error('Error parsing file.')
          const accountsData = csvToArray(e.target.result.toString())
          if (!isValidAccountsFile(accountsData)) return
          setFileContents(
            accountsData.map((account) => ({
              ...account,
              amount: Number(account.amount),
            }))
          )
        }
        reader.readAsText(accountsFile)
      }
    }
  }, [accountsFile])

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

  const getTotalAirdropAmount = (accounts: Array<AccountProps>) => {
    return accounts.reduce(
      (acc: number, curr: AccountProps) => acc + parseInt(curr.amount),
      0
    )
  }

  const isFormDataValid = () => {
    if (!fileContents) {
      toast.error('Error parsing accounts file')
      return false
    }
    if (projectName.trim() === '') {
      toast.error('Please enter a project name')
      return false
    }
    if (cw20TokenAddress.trim() === '') {
      toast.error('Please enter a cw20 token address')
      return false
    }
    if (startType !== 'null' && start.trim() === '' && startDate === null) {
      toast.error('Please enter a start value')
      return false
    }
    if (
      expirationType !== 'null' &&
      expiration.trim() === '' &&
      expirationDate === null
    ) {
      toast.error('Please enter an expiration value')
      return false
    }
    return true
  }

  const uploadJSONOnClick = async () => {
    try {
      if (!accountsFile) {
        if (inputFile.current) inputFile.current.click()
      } else {
        if (!isFormDataValid()) return

        if (!wallet.initialized)
          return toast.error('Please connect your wallet!')

        setLoading(true)

        toast('Validating your cw20 token address')
        await isCW20TokenValid(cw20TokenAddress)

        const contractAddress = await instantiate()

        const totalAmount = getTotalAirdropAmount(fileContents)
        const startData =
          startType === 'height'
            ? Number(start)
            : startType === 'timestamp'
            ? startDate
              ? Math.floor(startDate.getTime() / 1000)
              : null
            : null
        const expirationData =
          expirationType === 'height'
            ? Number(expiration)
            : expirationType === 'timestamp'
            ? expirationDate
              ? Math.floor(expirationDate.getTime() / 1000)
              : null
            : null
        const stage = 0

        const airdrop = {
          name: projectName,
          cw20TokenAddress,
          start: startData,
          startType: startData ? startType : null,
          expiration: expirationData,
          expirationType: expirationData ? expirationType : null,
          accounts: fileContents,
          totalAmount,
          contractAddress,
          stage,
        }

        toast('Uploading your airdrop file')
        await uploadObject(
          `${contractAddress}-${stage}.json`,
          JSON.stringify(airdrop)
        )

        toast('Prepearing your airdrop for processing')
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/airdrops`,
          { contractAddress, stage },
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
      cw20_token_address: cw20TokenAddress,
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
      `${projectName} Airdrop`,
      'auto'
    )

    return response.contractAddress
  }

  const startTypeOnChange = (value: string) => {
    switch (value) {
      case 'height':
        setStartType('height')
        break
      case 'timestamp':
        setStartType('timestamp')
        break
      default:
        setStartType('null')
        break
    }
    setStart('')
    setStartDate(null)
  }

  const expirationTypeOnChange = (value: string) => {
    switch (value) {
      case 'height':
        setExpirationType('height')
        break
      case 'timestamp':
        setExpirationType('timestamp')
        break
      default:
        setExpirationType('null')
        break
    }
    setExpiration('')
    setExpirationDate(null)
  }

  return (
    <div className="h-3/4 w-3/4">
      <h1 className="text-6xl font-bold mb-4 text-center">Create Airdrop</h1>
      <div className="text-xl mb-2 text-center">
        <span>
          Make sure you check our
          <a
            href="https://docs.juno.tools/docs/dashboards/airdrop/guide#create"
            target="_blank"
            rel="noreferrer"
            className="text-juno font-bold"
          >
            {' '}
            documentation{' '}
          </a>
          on how to create your airdrop
        </span>
      </div>

      <div>
        <div className="mb-4">
          <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
            Project Name
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-black text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={projectName}
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
            CW20 Token Address
          </label>
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 text-black text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder={cw20TokenAddress}
            value={cw20TokenAddress}
            onChange={(e) => setCW20TokenAddress(e.target.value)}
          />
        </div>
        <div className="flex">
          <div className="mb-4 w-full">
            <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
              Choose Start Type
            </label>
            <select
              className="select select-bordered w-full text-black dark:bg-white"
              onChange={(e) => startTypeOnChange(e.target.value)}
            >
              <option selected={startType === 'height'} value="height">
                Block Height
              </option>
              <option selected={startType === 'timestamp'} value="timestamp">
                Timestamp
              </option>
              <option selected={startType === 'null'} value={'null'}>
                None
              </option>
            </select>
          </div>
          {startType === 'height' && (
            <div className="mb-4 w-full ml-6">
              <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
                Start Block Height
              </label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-black text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={start}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
          )}
          {startType === 'timestamp' && (
            <div className="mb-4 w-full ml-6">
              <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
                Select Start Date
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                className="w-full h-12 text-black p-2 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
        <div className="flex">
          <div className="mb-4 w-full">
            <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
              Choose Expiration Type
            </label>
            <select
              className="select select-bordered w-full text-black dark:bg-white"
              onChange={(e) => expirationTypeOnChange(e.target.value)}
            >
              <option selected={expirationType === 'height'} value="height">
                Block Height
              </option>
              <option
                selected={expirationType === 'timestamp'}
                value="timestamp"
              >
                Timestamp
              </option>
              <option selected={expirationType === 'null'} value={'null'}>
                None
              </option>
            </select>
          </div>
          {expirationType === 'height' && (
            <div className="mb-4 w-full ml-6">
              <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
                Expiration Block Height
              </label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-black text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={expiration}
                value={expiration}
                onChange={(e) => setExpiration(e.target.value)}
              />
            </div>
          )}
          {expirationType === 'timestamp' && (
            <div className="mb-4 w-full ml-6">
              <label className="block mb-2 text-lg font-bold text-gray-900 dark:text-gray-300">
                Select Expiration Date
              </label>
              <DatePicker
                selected={expirationDate}
                onChange={(date) => setExpirationDate(date)}
                showTimeSelect
                className="w-full h-12 text-black p-2 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
      {accountsFile && (
        <div className="font-bold flex justify-center items-center text-lg">
          Selected file name: {accountsFile.name}{' '}
          <IoCloseSharp
            onClick={removeFileOnClick}
            className="ml-1 w-5 h-5 cursor-pointer"
          />
        </div>
      )}
      {fileContents && (
        <SyntaxHighlighter
          language="javascript"
          style={prism}
          customStyle={{ maxHeight: 470, height: 470 }}
        >
          {`${JSON.stringify(fileContents.slice(0, 4), null, 2)}${
            fileContents.length > 4 ? '...and more' : ''
          }`}
        </SyntaxHighlighter>
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
        } mb-28`}
        style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
        disabled={loading}
        onClick={uploadJSONOnClick}
      >
        {!!accountsFile ? 'Create Airdrop' : 'Select Accounts File'}
      </button>
      <br />
    </div>
  )
}

export default CreateAirdrop
