import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { Input } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCw20 } from 'components/PageHeaderCw20'
import { useInstantiateCw20Form } from 'hooks/useInstantiateCw20Form'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { FaAsterisk } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

const CW20InstantiatePage: NextPage = () => {
  const form = useInstantiateCw20Form()
  const { formState, register, result, submitHandler } = form

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={void submitHandler}>
      <NextSeo title="Instantiate CW20 Token" />

      <PageHeaderCw20 />

      <LinkTabs activeIndex={0} data={cw20LinkTabs} />

      <Conditional test={result !== null}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing the contract address and the transaction
          hash.
        </Alert>
        <JsonPreview content={result} title="Transaction Result" />
        <br />
      </Conditional>

      <FormGroup subtitle="Basic information about your new contract" title="Token Details">
        <FormControl htmlId="name" isRequired title="Name">
          <Input
            id="name"
            placeholder="My Awesome CW20 Contract"
            required
            type="text"
            {...register('name', {
              required: true,
            })}
          />
        </FormControl>
        <FormControl htmlId="symbol" isRequired title="Symbol">
          <Input
            id="symbol"
            placeholder="AWSM"
            required
            type="text"
            {...register('symbol', {
              required: true,
              setValueAs: (val: string) => val.toUpperCase(),
            })}
          />
        </FormControl>
        <FormControl htmlId="decimals" isRequired title="Decimals">
          <Input
            id="decimals"
            placeholder="6"
            required
            type="number"
            {...register('decimals', {
              required: true,
              valueAsNumber: true,
            })}
          />
        </FormControl>
        <FormControl htmlId="initial-balance" title="Initial Balance">
          <Input
            id="initial-balance"
            placeholder="10000"
            type="number"
            {...register('initialBalance', {
              required: false,
            })}
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup subtitle="Your new contract minting rules" title="Mint">
        <FormControl htmlId="minter-address" title="Minter Address">
          <Input
            id="minter-address"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            type="text"
            {...register('minterAddress', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl htmlId="cap" title="Cap">
          <Input
            id="cap"
            placeholder="9999"
            type="number"
            {...register('cap', {
              required: false,
              valueAsNumber: true,
            })}
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup subtitle="Public metadata for your new contract" title="Marketing">
        <FormControl htmlId="project" title="Project">
          <Input
            id="project"
            placeholder="My Awesome Project"
            type="text"
            {...register('projectName', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl htmlId="description" title="Description">
          <Input
            id="description"
            placeholder="This is my awesome contract project"
            type="text"
            {...register('description', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl htmlId="wallet-address" title="Wallet Address">
          <Input
            id="wallet-address"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            type="string"
            {...register('marketingAddress', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl htmlId="logo-url" title="Logo URL">
          <Input
            id="logo-url"
            placeholder="https://example.com/icon.png"
            type="text"
            {...register('logoUrl', {
              required: false,
            })}
          />
        </FormControl>
      </FormGroup>

      <div className="flex justify-end p-4">
        <Button isLoading={formState.isSubmitting} isWide rightIcon={<FaAsterisk />} type="submit">
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(CW20InstantiatePage, { center: false })
