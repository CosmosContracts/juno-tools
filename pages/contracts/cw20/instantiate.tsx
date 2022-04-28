import { Alert } from 'components/Alert'
import { Button } from 'components/Button'
import { Conditional } from 'components/Conditional'
import { FormControl } from 'components/FormControl'
import { FormGroup } from 'components/FormGroup'
import { Input } from 'components/Input'
import { JsonPreview } from 'components/JsonPreview'
import { LinkTabs } from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import { PageHeaderCW20 } from 'components/PageHeaderCW20'
import { useInstantiateCW20Form } from 'hooks/useInstantiateCW20Form'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { FaAsterisk } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

const CW20InstantiatePage: NextPage = () => {
  const form = useInstantiateCW20Form()
  const { formState, register, result, submitHandler } = form

  return (
    <form className="py-6 px-12 space-y-4" onSubmit={submitHandler}>
      <NextSeo title="Instantiate CW20 Token" />

      <PageHeaderCW20 />

      <LinkTabs data={cw20LinkTabs} activeIndex={0} />

      <Conditional test={result != null}>
        <Alert type="info">
          <b>Instantiate success!</b> Here is the transaction result containing
          the contract address and the transaction hash.
        </Alert>
        <JsonPreview title="Transaction Result" content={result} />
        <br />
      </Conditional>

      <FormGroup
        title="Token Details"
        subtitle="Basic information about your new contract"
      >
        <FormControl title="Name" htmlId="name" isRequired>
          <Input
            id="name"
            type="text"
            placeholder="My Awesome CW20 Contract"
            required
            {...register('name', {
              required: true,
            })}
          />
        </FormControl>
        <FormControl title="Symbol" htmlId="symbol" isRequired>
          <Input
            id="symbol"
            type="text"
            placeholder="AWSM"
            required
            {...register('symbol', {
              required: true,
              setValueAs: (val: string) => val.toUpperCase(),
            })}
          />
        </FormControl>
        <FormControl title="Decimals" htmlId="decimals" isRequired>
          <Input
            id="decimals"
            type="number"
            placeholder="6"
            required
            {...register('decimals', {
              required: true,
              valueAsNumber: true,
            })}
          />
        </FormControl>
        <FormControl title="Initial Balance" htmlId="initial-balance">
          <Input
            id="initial-balance"
            type="number"
            placeholder="10000"
            {...register('initialBalance', {
              required: false,
            })}
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup title="Mint" subtitle="Your new contract minting rules">
        <FormControl title="Minter Address" htmlId="minter-address">
          <Input
            id="minter-address"
            type="text"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            {...register('minterAddress', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl title="Cap" htmlId="cap">
          <Input
            id="cap"
            type="number"
            placeholder="9999"
            {...register('cap', {
              required: false,
              valueAsNumber: true,
            })}
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup
        title="Marketing"
        subtitle="Public metadata for your new contract"
      >
        <FormControl title="Project" htmlId="project">
          <Input
            id="project"
            type="text"
            placeholder="My Awesome Project"
            {...register('projectName', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl title="Description" htmlId="description">
          <Input
            id="description"
            type="text"
            placeholder="This is my awesome contract project"
            {...register('description', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl title="Wallet Address" htmlId="wallet-address">
          <Input
            id="wallet-address"
            type="string"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            {...register('marketingAddress', {
              required: false,
            })}
          />
        </FormControl>
        <FormControl title="Logo URL" htmlId="logo-url">
          <Input
            id="logo-url"
            type="text"
            placeholder="https://example.com/icon.png"
            {...register('logoUrl', {
              required: false,
            })}
          />
        </FormControl>
      </FormGroup>

      <div className="flex justify-end p-4">
        <Button
          isLoading={formState.isSubmitting}
          isWide
          rightIcon={<FaAsterisk />}
          type="submit"
        >
          Instantiate Contract
        </Button>
      </div>
    </form>
  )
}

export default withMetadata(CW20InstantiatePage, { center: false })
