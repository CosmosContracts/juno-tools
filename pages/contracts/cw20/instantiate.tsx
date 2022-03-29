import clsx from 'clsx'
import FormControl from 'components/FormControl'
import FormGroup from 'components/FormGroup'
import Input from 'components/Input'
import LinkTabs from 'components/LinkTabs'
import { cw20LinkTabs } from 'components/LinkTabs.data'
import PageHeaderCW20 from 'components/PageHeaderCW20'
import { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import { CgSpinnerAlt } from 'react-icons/cg'
import { FaAsterisk } from 'react-icons/fa'
import { withMetadata } from 'utils/layout'

const CW20InstantiatePage: NextPage = () => {
  // TODO: implement actual loading logic
  const isLoading = false

  return (
    <section className="py-6 px-12 space-y-4">
      <NextSeo title="Instantiate CW20 Token" />

      <PageHeaderCW20 />

      <LinkTabs data={cw20LinkTabs} activeIndex={0} />

      <FormGroup
        title="Token Details"
        subtitle="Basic information about your new contract"
      >
        <FormControl title="Name" htmlId="contract-name">
          <Input
            id="contract-name"
            name="name"
            type="text"
            placeholder="My Awesome CW20 Contract"
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Symbol" htmlId="contract-symbol">
          <Input
            id="contract-symbol"
            name="symbol"
            type="text"
            placeholder="AWSM"
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Decimals" htmlId="contract-decimals">
          <Input
            id="contract-decimals"
            name="decimals"
            type="number"
            placeholder="6"
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Initial Balance" htmlId="contract-initial-balance">
          <Input
            id="contract-initial-balance"
            name="initial-balance"
            type="number"
            placeholder="10000"
            // TODO: integrate form logic
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup title="Mint" subtitle="Your new contract minting rules">
        <FormControl title="Minter Address" htmlId="contract-minter-address">
          <Input
            id="contract-minter-address"
            name="minter-address"
            type="text"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Cap" htmlId="contract-cap">
          <Input
            id="contract-cap"
            name="cap"
            type="number"
            placeholder="9999"
            // TODO: integrate form logic
          />
        </FormControl>
      </FormGroup>

      <hr className="border-white/25" />

      <FormGroup
        title="Marketing"
        subtitle="Public metadata for your new contract"
      >
        <FormControl title="Project" htmlId="contract-project">
          <Input
            id="contract-project"
            name="project"
            type="text"
            placeholder="My Awesome Project"
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Description" htmlId="contract-description">
          <Input
            id="contract-description"
            name="description"
            type="text"
            placeholder="This is my awesome contract project"
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Wallet Address" htmlId="contract-wallet-address">
          <Input
            id="contract-wallet-address"
            name="wallet-address"
            type="string"
            placeholder="juno1234567890abcdefghijklmnopqrstuvwxyz..."
            // TODO: integrate form logic
          />
        </FormControl>
        <FormControl title="Logo URL" htmlId="contract-logo-url">
          <Input
            id="contract-logo-url"
            name="logo-url"
            type="text"
            placeholder="https://example.com/icon.png"
            // TODO: integrate form logic
          />
        </FormControl>
      </FormGroup>

      <div className="flex justify-end p-4">
        <button
          disabled={!isLoading}
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
            { 'animate-pulse cursor-wait pointer-events-none': isLoading }
          )}
        >
          {isLoading ? (
            <CgSpinnerAlt className="animate-spin" />
          ) : (
            <FaAsterisk />
          )}
          <span>Instantiate Contract</span>
        </button>
      </div>
    </section>
  )
}

export default withMetadata(CW20InstantiatePage, { center: false })
