import { fromAscii, toAscii } from '@cosmjs/encoding'
import axios from 'axios'
import clsx from 'clsx'
import { compare } from 'compare-versions'
import AirdropsStepper from 'components/AirdropsStepper'
import Anchor from 'components/Anchor'
import Button from 'components/Button'
import FormControl from 'components/FormControl'
import Input from 'components/Input'
import InputDateTime from 'components/InputDateTime'
import JsonPreview from 'components/JsonPreview'
import Radio from 'components/Radio'
import { useContracts } from 'contexts/contracts'
import { useWallet } from 'contexts/wallet'
import type { NextPage } from 'next'
import Router from 'next/router'
import { NextSeo } from 'next-seo'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { FaAsterisk } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import { uploadObject } from 'services/s3'
import { CW20_MERKLE_DROP_CODE_ID } from 'utils/constants'
import csvToArray from 'utils/csvToArray'
import { AccountProps, isValidAccountsFile } from 'utils/isValidAccountsFile'
import { withMetadata } from 'utils/layout'
import { links } from 'utils/links'

const START_RADIO_VALUES = [
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

const END_RADIO_VALUES = [
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
  const cw20BaseContract = useContracts().cw20Base
  const cw20MerkleAirdropContract = useContracts().cw20MerkleAirdrop

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

  const transactionMessage = cw20MerkleAirdropContract
    ?.messages()
    ?.instantiate(CW20_MERKLE_DROP_CODE_ID, `${projectName} Airdrop`, {
      owner: wallet.address,
      cw20_token_address: cw20TokenAddress,
    })

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
    if (!cw20BaseContract)
      return toast.error('Could not connect to smart contract')
    await cw20BaseContract?.use(cw20TokenAddress)?.tokenInfo()
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
          pathname: '/airdrops/escrow',
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

    if (!cw20MerkleAirdropContract || !transactionMessage)
      return toast.error('Could not connect to smart contract')

    const response = await cw20MerkleAirdropContract.instantiate(
      transactionMessage.codeId,
      transactionMessage.msg,
      transactionMessage.label,
      transactionMessage.admin
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

  const isValidToCreate =
    projectName != '' && accountsFile != null && cw20TokenAddress != ''

  return (
    <div className="relative py-6 px-12 space-y-8">
      <NextSeo title="Create Airdrop" />

      <div className="space-y-8 text-center">
        <h1 className="font-heading text-4xl font-bold">Create Airdrop</h1>
        <div className="flex justify-center">
          <AirdropsStepper step={1} />
        </div>
        <p>
          Make sure you check our{' '}
          <Anchor
            href={links['Docs Create Airdrop']}
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
        <FormControl
          title="Name"
          subtitle="This is how people will find you in the list of airdrops."
          htmlId="airdrop-name"
        >
          <Input
            id="airdrop-name"
            name="name"
            type="text"
            placeholder="My Awesome Airdrop"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </FormControl>

        {/* CW20 token address */}
        <FormControl
          title="CW20 Address"
          subtitle=" Address of the CW20 token that will be airdropped."
          htmlId="airdrop-cw20"
        >
          <Input
            id="airdrop-cw20"
            name="cw20"
            type="text"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            value={cw20TokenAddress}
            onChange={(e) => setCW20TokenAddress(e.target.value)}
          />
        </FormControl>

        {/* start type */}
        <FormControl
          title="Start time"
          subtitle="When should this airdrop begin?"
        >
          <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
            {START_RADIO_VALUES.map(({ id, title, subtitle }) => (
              <Radio
                key={`start-${id}`}
                id={id}
                htmlFor="start"
                title={title}
                subtitle={subtitle}
                onChange={() => startTypeOnChange(id)}
                checked={startType == id}
              >
                {startType == 'height' && (
                  <Input
                    type="number"
                    placeholder="Enter start block height"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                  />
                )}
                {startType == 'timestamp' && (
                  <InputDateTime
                    onChange={(date) => setStartDate(date)}
                    minDate={new Date()}
                    value={startDate ?? undefined}
                  />
                )}
              </Radio>
            ))}
          </fieldset>
        </FormControl>

        {/* end type */}
        <FormControl
          title="End time"
          subtitle="When should this airdrop conclude?"
        >
          <fieldset className="p-4 space-y-4 rounded border-2 border-white/25">
            {END_RADIO_VALUES.map(({ id, title, subtitle }) => (
              <Radio
                key={`end-${id}`}
                id={id}
                htmlFor="end"
                title={title}
                subtitle={subtitle}
                onChange={() => expirationTypeOnChange(id)}
                checked={expirationType == id}
              >
                {expirationType == 'height' && (
                  <Input
                    type="number"
                    placeholder="Enter end block height"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                  />
                )}
                {expirationType == 'timestamp' && (
                  <InputDateTime
                    onChange={(date) => setExpirationDate(date)}
                    minDate={new Date()}
                    value={expirationDate ?? undefined}
                  />
                )}
              </Radio>
            ))}
          </fieldset>
        </FormControl>

        {/* accounts csv */}
        <FormControl
          title="Accounts"
          subtitle={
            <>
              What accounts should receive tokens, and how many should each
              account receive?
              <br />
              {!accountsFile && (
                <span className="text-sm text-white/50">
                  To specify accounts, upload a CSV file by clicking the button
                  below or drag and drop the file below.
                </span>
              )}
            </>
          }
          className="col-span-2"
        >
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
          {/* TODO: replace with JsonPreview component */}
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
        </FormControl>
      </div>

      {isValidToCreate && (
        <JsonPreview
          title="Show Transaction Message"
          content={transactionMessage}
          copyable
          isVisible={false}
        />
      )}

      <div
        className={clsx('flex justify-end pb-6', {
          'sticky right-0 bottom-0': isValidToCreate,
        })}
      >
        <Button
          isDisabled={!isValidToCreate}
          isLoading={loading}
          isWide
          leftIcon={<FaAsterisk />}
          onClick={uploadJSONOnClick}
        >
          Create Airdrop
        </Button>
      </div>
    </div>
  )
}

export default withMetadata(CreateAirdropPage, { center: false })
