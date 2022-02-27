import { fromAscii, toAscii } from '@cosmjs/encoding'
import axios from 'axios'
import clsx from 'clsx'
import { compare } from 'compare-versions'
import AirdropsStepper from 'components/AirdropsStepper'
import Anchor from 'components/Anchor'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Router from 'next/router'
import { NextSeo } from 'next-seo'
import { Fragment, useEffect, useRef, useState } from 'react'
import DateTimePicker from 'react-datetime-picker/dist/entry.nostyle'
import toast from 'react-hot-toast'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import { uploadObject } from 'services/s3'
import {
  MAINNET_CW20_MERKLE_DROP_CODE_ID,
  TESTNET_CW20_MERKLE_DROP_CODE_ID,
} from 'utils/constants'
import csvToArray from 'utils/csvToArray'
import { AccountProps, isValidAccountsFile } from 'utils/isValidAccountsFile'
import { withMetadata } from 'utils/layout'

const AIRDROP_CREATE_DOCS = `https://docs.juno.tools/docs/dashboards/airdrop/guide#create`

const START_RADIOS = [
  {
    id: 'null',
    title: 'Immediately',
    subtitle: `This airdrop will be available immediately as soon as funding is complete.`,
  },
  {
    id: 'height',
    title: 'Block Height',
    subtitle: 'Choose a specific block height for this airdrop to begin.',
  },
  {
    id: 'timestamp',
    title: 'Timestamp',
    subtitle: 'Specific a calendar date and time of day.',
  },
]

const END_RADIOS = [
  {
    id: 'null',
    title: 'Immediately',
    subtitle: `This airdrop has no end and will remain active until all available airdrops are claimed.`,
  },
  {
    id: 'height',
    title: 'Block Height',
    subtitle: 'Choose a specific block height for this airdrop to begin.',
  },
  {
    id: 'timestamp',
    title: 'Timestamp',
    subtitle: 'Specific a calendar date and time of day.',
  },
]

type StartEndValue = 'null' | 'height' | 'timestamp'

const getTotalAirdropAmount = (accounts: Array<AccountProps>) => {
  return accounts.reduce(
    (acc: number, curr: AccountProps) => acc + parseInt(curr.amount),
    0
  )
}

const CreateAirdropPage: NextPage = () => {
  const wallet = useWallet()
  const contract = useContracts().cw20Base

  const [loading, setLoading] = useState(false)
  const [accountsFile, setAccountsFile] = useState<File | null>(null)
  const [fileContents, setFileContents] = useState<any>(null)
  const [projectName, setProjectName] = useState('')
  const [cw20TokenAddress, setCW20TokenAddress] = useState('')
  const [start, setStart] = useState('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [startType, setStartType] = useState<StartEndValue>('null')
  const [expiration, setExpiration] = useState('')
  const [expirationDate, setExpirationDate] = useState<Date | null>(null)
  const [expirationType, setExpirationType] = useState<StartEndValue>('null')

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

  const isValidToCreate = projectName != null && accountsFile != null

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Create Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold">Create Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={1} />
        </div>
        <p>
          Make sure you check our{' '}
          <Anchor
            href={AIRDROP_CREATE_DOCS}
            className="font-bold text-plumbus hover:underline"
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
          <label className="flex flex-col space-y-1" htmlFor="airdrop-name">
            <span className="font-bold">Name</span>
            <span className="text-sm text-white/50">
              This is how people will find you in the list of airdrops.
            </span>
          </label>
          <input
            id="airdrop-name"
            name="name"
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
          <label className="flex flex-col space-y-1" htmlFor="airdrop-cw20">
            <span className="font-bold">CW20 Address</span>
            <span className="text-sm text-white/50">
              Address of the CW20 token that will be airdropped.
            </span>
          </label>
          <input
            id="airdrop-cw20"
            name="cw20"
            type="text"
            className={clsx(
              'bg-white/10 rounded border-2 border-white/20 form-input',
              'placeholder:text-white/50',
              'focus:ring focus:ring-plumbus-20'
            )}
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            value={cw20TokenAddress}
            onChange={(e) => setCW20TokenAddress(e.target.value)}
          />
        </div>

        {/* start type */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-1">
            <span className="font-bold">Start time</span>
            <span className="text-sm text-white/50">
              When should this airdrop begin?
            </span>
          </div>
          <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
            {START_RADIOS.map(({ id, title, subtitle }) => (
              <Fragment key={`start-${id}`}>
                <div className="flex space-x-4 w-full">
                  <input
                    id={`start-${id}`}
                    name="start-type"
                    type="radio"
                    className="mt-1 w-4 h-4 text-plumbus focus:ring-plumbus cursor-pointer form-radio"
                    onChange={() => startTypeOnChange(id)}
                    checked={startType == id}
                  />
                  <div className="flex flex-col flex-grow space-y-2">
                    <label
                      htmlFor={`start-${id}`}
                      className="group cursor-pointer"
                    >
                      <span className="block font-bold group-hover:underline">
                        {title}
                      </span>
                      <span className="block text-sm">{subtitle}</span>
                    </label>
                    {startType == id && startType == 'height' && (
                      <input
                        type="number"
                        className={clsx(
                          'bg-white/10 rounded border-2 border-white/20 form-input',
                          'placeholder:text-white/50',
                          'focus:ring focus:ring-plumbus-20'
                        )}
                        placeholder="Enter start block height"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                      />
                    )}
                    {startType == id && startType == 'timestamp' && (
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
                </div>
              </Fragment>
            ))}
          </fieldset>
        </div>

        {/* end type */}
        <div className="flex flex-col space-y-2">
          <div className="flex flex-col space-y-1">
            <span className="font-bold">End time</span>
            <span className="text-sm text-white/50">
              When should this airdrop conclude?
            </span>
          </div>
          <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
            {END_RADIOS.map(({ id, title, subtitle }) => (
              <Fragment key={`end-${id}`}>
                <div className="flex space-x-4 w-full">
                  <input
                    id={`end-${id}`}
                    name="end-type"
                    type="radio"
                    className="mt-1 w-4 h-4 text-plumbus focus:ring-plumbus cursor-pointer form-radio"
                    onChange={() => expirationTypeOnChange(id)}
                    checked={expirationType == id}
                  />
                  <div className="flex flex-col flex-grow space-y-2">
                    <label
                      htmlFor={`end-${id}`}
                      className="group cursor-pointer"
                    >
                      <span className="block font-bold group-hover:underline">
                        {title}
                      </span>
                      <span className="block text-sm">{subtitle}</span>
                    </label>
                    {expirationType == id && expirationType == 'height' && (
                      <input
                        type="number"
                        className={clsx(
                          'bg-white/10 rounded border-2 border-white/20 form-input',
                          'placeholder:text-white/50',
                          'focus:ring focus:ring-plumbus-20'
                        )}
                        placeholder="Enter end block height"
                        value={expiration}
                        onChange={(e) => setExpiration(e.target.value)}
                      />
                    )}
                    {expirationType == id && expirationType == 'timestamp' && (
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
              </Fragment>
            ))}
          </fieldset>
        </div>

        {/* accounts csv */}
        <div className="flex flex-col col-span-2 space-y-2">
          <div className="flex flex-col space-y-1">
            <span className="font-bold">Accounts</span>
            <span className="text-sm text-white/50">
              What accounts should receive tokens, and how many should each
              account receive?
            </span>
            {!accountsFile && (
              <span className="text-sm text-white/50">
                To specify accounts, upload a CSV file by clicking the button
                below or drag and drop the file below.
              </span>
            )}
          </div>
          {!accountsFile && (
            <div
              className={clsx(
                'flex relative justify-center items-center space-y-4 h-32',
                'rounded border-2 border-white/20 border-dashed'
              )}
            >
              <input
                accept=".csv"
                className={clsx(
                  'file:py-2 file:px-4 file:mr-4 file:bg-plumbus-light file:rounded file:border-0 cursor-pointer',
                  'before:absolute before:inset-0 before:hover:bg-white/5 before:transition'
                )}
                onChange={onFileChange}
                ref={inputFile}
                type="file"
              />
            </div>
          )}
          {accountsFile && (
            <div className="flex flex-col bg-stone-800/80 rounded border-2 border-white/20">
              <div className="flex justify-center py-2 px-4 space-x-2 border-b-2 border-white/20">
                <span className="font-mono">{accountsFile.name}</span>
                <button
                  className="flex items-center text-plumbus hover:text-plumbus-light rounded-full"
                  onClick={removeFileOnClick}
                >
                  <IoCloseSharp size={22} />
                </button>
              </div>
              {fileContents && (
                <div className="overflow-auto p-2 h-[400px] font-mono text-sm hover:resize-y">
                  <pre>{JSON.stringify(fileContents, null, 2).trim()}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={clsx('flex justify-end pb-6', {
          'sticky right-0 bottom-0': isValidToCreate,
        })}
      >
        <button
          disabled={!isValidToCreate || loading}
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            {
              'opacity-50 cursor-not-allowed pointer-events-none':
                !isValidToCreate,
            },
            { 'animate-pulse cursor-wait pointer-events-none': loading }
          )}
          onClick={uploadJSONOnClick}
        >
          {loading ? <CgSpinnerAlt className="animate-spin" /> : <FaAsterisk />}
          <span>Create Airdrop</span>
        </button>
      </div>
    </div>
  )
}

export default withMetadata(CreateAirdropPage, { center: false })
