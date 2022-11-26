import { WalletSection } from 'components/walletConnect'
import type { NextPage } from 'next'
import { withMetadata } from 'utils/layout'

const HomePage: NextPage = () => {
  return (
    <section className="px-8 pt-4 pb-16 mx-auto space-y-8 max-w-4xl">
      <h1 className="font-heading text-4xl font-bold">Welcome!</h1>
      <p className="text-xl">
        JunoTools is a Swiss Army knife that helps you build on Juno by providing smart contract front ends. We call
        these front-end apps <b>Smart Contact Dashboards</b>.
      </p>
      <WalletSection />
    </section>
  )
}

export default withMetadata(HomePage, { center: false })
