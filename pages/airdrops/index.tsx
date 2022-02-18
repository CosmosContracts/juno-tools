import clsx from 'clsx'
import Anchor from 'components/Anchor'
import { NextPage } from 'next'
import { FaHatWizard } from 'react-icons/fa'
import { GiPayMoney } from 'react-icons/gi'

const routes = [
  {
    Icon: GiPayMoney,
    title: 'Claim Airdrops',
    subtitle: 'View and claim available airdrops',
    href: '/airdrops/list',
  },
  {
    Icon: FaHatWizard,
    title: 'Manage Airdrops',
    subtitle: 'Create and fund new airdrops',
    href: '/airdrops/manage',
  },
]

const AirdropsPage: NextPage = () => {
  return (
    <section className="py-6 px-12 space-y-4 text-center">
      <h1 className="text-4xl font-bold">Airdrop Tokens</h1>

      <p className="text-xl">
        Looking for a fast and efficient way to airdrop your project? Or come to
        claim your allocation?
        <br />
        Use our airdrop tool to create and/or claim your airdrop!
      </p>

      <br />

      <div className="grid grid-cols-2 gap-4">
        {routes.map(({ Icon, title, subtitle, href }) => (
          <Anchor
            key={href}
            href={href}
            className={clsx(
              'p-8 hover:bg-white/5 hover:shadow-lg transition hover:translate-y-[-2px]',
              'rounded-md border-2 border-white/50 hover:border-plumbus',
              'flex flex-col items-center space-y-2'
            )}
          >
            <Icon size={48} className="mb-4" />
            <div className="text-2xl font-bold">{title}</div>
            <div className="text-white/75">{subtitle}</div>
          </Anchor>
        ))}
      </div>
    </section>
  )
}

export default AirdropsPage
