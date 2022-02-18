import clsx from 'clsx'
import Anchor from 'components/Anchor'
import type { NextPage } from 'next'
import { NextSeo } from 'next-seo'
import React from 'react'
import { FaAsterisk, FaBullseye, FaBurn } from 'react-icons/fa'

const MANAGE_AIRDROPS_DOCS = `https://docs.juno.tools/docs/dashboards/airdrop/guide`

const routes = [
  {
    Icon: FaAsterisk,
    title: 'Create Airdrop',
    href: '/airdrops/create',
  },
  {
    Icon: FaBullseye,
    title: 'Register Airdrop',
    href: '/airdrops/register',
  },
  {
    Icon: FaBurn,
    title: 'Fund Airdrop',
    href: '/airdrops/fund',
  },
]

const ManageAirdropsPage: NextPage = () => {
  return (
    <section className="py-6 px-12 space-y-4 text-center">
      <NextSeo title="Manage Airdrop" />

      <h1 className="text-4xl font-bold">Manage Airdrops</h1>

      <p className="text-xl">
        Read more on how to manage your airdrops on the{' '}
        <Anchor
          href={MANAGE_AIRDROPS_DOCS}
          className="text-plumbus hover:underline"
        >
          documentation page
        </Anchor>
      </p>

      <br />

      <div className="mx-auto space-y-4 max-w-md text-left">
        {routes.map(({ Icon, title, href }) => (
          <Anchor
            key={href}
            href={href}
            className={clsx(
              'p-8 hover:bg-white/5 hover:shadow-lg transition hover:translate-y-[-2px]',
              'rounded-md border-2 border-white/50 hover:border-plumbus',
              'flex justify-between items-center space-x-4'
            )}
          >
            <div className="text-2xl font-bold">{title}</div>
            <Icon size={36} />
          </Anchor>
        ))}
      </div>
    </section>
  )
}

export default ManageAirdropsPage
