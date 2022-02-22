import { fromAscii, toAscii } from '@cosmjs/encoding'
import axios from 'axios'
import clsx from 'clsx'
import { compare } from 'compare-versions'
import Anchor from 'components/Anchor'
import TooltipIcon from 'components/TooltipIcon'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Router from 'next/router'
import { NextSeo } from 'next-seo'
import React, { useEffect, useRef, useState } from 'react'
import DateTimePicker from 'react-datetime-picker/dist/entry.nostyle'
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
import { withMetadata } from 'utils/layout'

const AIRDROP_CREATE_DOCS = `https://docs.juno.tools/docs/dashboards/airdrop/guide#create`

const START_END_RECORD = {
  height: 'Block Height',
  timestamp: 'Timestamp',
  null: 'None',
} as const

type StartEndValue = keyof typeof START_END_RECORD

const getTotalAirdropAmount = (accounts: Array<AccountProps>) => {
  return accounts.reduce(
    (acc: number, curr: AccountProps) => acc + parseInt(curr.amount),
    0
  )
}

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
  const [startType, setStartType] = useState<StartEndValue>('height')
  const [expiration, setExpiration] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [expirationType, setExpirationType] = useState<StartEndValue>('height')

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
          try {
            if (!e.target?.result) return toast.error('Error parsing file.')
            const accountsData = csvToArray(e.target.result.toString())
            if (!isValidAccountsFile(accountsData)) return
            setFileContents(
              accountsData.map((account) => ({
                ...account,
                amount: Number(account.amount),
              }))
            )
          } catch (error: any) {
            toast.error(error.message)
          }
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
    setStartType(value as StartEndValue)
    setStart('')
    setStartDate(null)
  }

  const expirationTypeOnChange = (value: string) => {
    setExpirationType(value as StartEndValue)
    setExpiration('')
    setExpirationDate(null)
  }

  return (
    <div className="py-6 px-12 space-y-8">
      <NextSeo title="Create Airdrop" />

      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Create Airdrop</h1>
        <p>
          Make sure you check our{' '}
          <Anchor
            href={AIRDROP_CREATE_DOCS}
            className="font-bold text-plumbus-40"
          >
            documentation
          </Anchor>{' '}
          on how to create your airdrop
        </p>
      </div>

      <hr className="border-white/20" />

      <div className="grid grid-cols-2 gap-8">
        {/* project name */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <span className="font-bold">Project Name</span>
            <TooltipIcon label="Enter your new airdrop name" />
          </label>
          <input
            type="text"
            className={clsx(
              'bg-white/10 rounded border-2 border-white/20 form-input',
              'placeholder:text-white/50',
              'focus:ring focus:ring-plumbus-20'
            )}
            placeholder="My Awesome Airdrop"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>

        {/* CW20 token address */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <span className="font-bold">CW20 Token Address</span>
            <TooltipIcon label="Enter your CW20 token address" />
          </label>
          <input
            type="text"
            className={clsx(
              'bg-white/10 rounded border-2 border-white/20 form-input',
              'placeholder:text-white/50',
              'focus:ring focus:ring-plumbus-20'
            )}
            value={cw20TokenAddress}
            onChange={(e) => setCW20TokenAddress(e.target.value)}
          />
        </div>

        {/* start type */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <span className="font-bold">Choose Start Type</span>
          </label>
          <select
            className={clsx(
              'bg-white/10 rounded border-2 border-white/20 form-select',
              'placeholder:text-white/50',
              'focus:ring focus:ring-plumbus-20'
            )}
            onChange={(e) => startTypeOnChange(e.target.value)}
          >
            {Object.entries(START_END_RECORD).map(([value, name]) => (
              <option key={value} selected={startType === value} value={value}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* start value */}
        <div
          className={clsx('flex flex-col space-y-2', {
            invisible: startType == 'null',
          })}
        >
          <label className="flex items-center space-x-2">
            <span className="font-bold">
              Start {START_END_RECORD[startType]}
            </span>
          </label>
          {startType == 'height' && (
            <input
              type="number"
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-input',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20'
              )}
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          )}
          {startType == 'timestamp' && (
            <DateTimePicker
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-input',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20'
              )}
              onChange={(date) => setStartDate(date)}
              minDate={new Date()}
              value={startDate ?? undefined}
            />
          )}
        </div>

        {/* end type */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <span className="font-bold">Choose Expiration Type</span>
          </label>
          <select
            className={clsx(
              'bg-white/10 rounded border-2 border-white/20 form-select',
              'placeholder:text-white/50',
              'focus:ring focus:ring-plumbus-20'
            )}
            onChange={(e) => expirationTypeOnChange(e.target.value)}
          >
            {Object.entries(START_END_RECORD).map(([value, name]) => (
              <option
                key={value}
                selected={expirationType === value}
                value={value}
              >
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* end value */}
        <div
          className={clsx('flex flex-col space-y-2', {
            invisible: expirationType == 'null',
          })}
        >
          <label className="flex items-center space-x-2">
            <span className="font-bold">
              End {START_END_RECORD[expirationType]}
            </span>
          </label>
          {expirationType == 'height' && (
            <input
              type="number"
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-input',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20'
              )}
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
            />
          )}
          {expirationType == 'timestamp' && (
            <DateTimePicker
              className={clsx(
                'bg-white/10 rounded border-2 border-white/20 form-input',
                'placeholder:text-white/50',
                'focus:ring focus:ring-plumbus-20'
              )}
              onChange={(date) => setExpirationDate(date)}
              minDate={new Date()}
              value={expirationDate ?? undefined}
            />
          )}
        </div>
      </div>

      {accountsFile && (
        <div className="flex justify-center items-center text-lg font-bold">
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
        accept=".csv"
        id="file"
        onChange={onFileChange}
        ref={inputFile}
        style={{ display: 'none' }}
        type="file"
      />

      <br />

      <button
        className={clsx(
          'py-2 px-4 w-full font-bold',
          'bg-plumbus-60 hover:bg-plumbus-50 rounded focus:ring',
          { 'opacity-50 cursor-wait': loading }
        )}
        disabled={loading}
        onClick={uploadJSONOnClick}
      >
        {!!accountsFile ? 'Create Airdrop' : 'Select Accounts File (.csv)'}
      </button>
    </div>
  )
}

export default withMetadata(CreateAirdrop, { center: false })
