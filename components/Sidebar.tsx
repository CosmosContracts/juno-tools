import Brand from 'assets/brand.svg'
import clsx from 'clsx'
import { useWallet } from 'contexts/wallet'
import { useRouter } from 'next/router'
import { footerLinks, links, socialsLinks } from 'utils/links'

import Anchor from './Anchor'
import SidebarLayout from './SidebarLayout'
import WalletLoader from './WalletLoader'

const routes = [
  { text: 'Airdrops', href: `/airdrops` },
  { text: 'CW1 Tokens', href: `/contracts/cw1` },
  { text: 'CW20 Tokens', href: `/contracts/cw20` },
]

const Sidebar = () => {
  const router = useRouter()
  const wallet = useWallet()

  return (
    <SidebarLayout>
      {/* juno brand as home button */}
      <Anchor href="/">
        <Brand className="w-2/4" />
      </Anchor>

      {/* wallet button */}
      <WalletLoader />

      {/* main navigation routes */}
      {routes.map(({ text, href }) => (
        <Anchor
          href={href}
          key={href}
          className={clsx(
            'py-2 px-4 -mx-4 uppercase', // styling
            'hover:bg-white/5 transition-colors', // hover styling
            { 'font-bold text-plumbus': router.asPath.startsWith(href) } // active route styling
          )}
        >
          {text}
        </Anchor>
      ))}

      <div className="flex-grow" />

      {/* juno network status */}
      <div className="text-sm">Network: {wallet.network}</div>

      {/* footer reference links */}
      <ul className="text-sm list-disc list-inside">
        {footerLinks.map(({ href, text }) => (
          <li key={href}>
            <Anchor href={href} className="hover:text-plumbus hover:underline">
              {text}
            </Anchor>
          </li>
        ))}
      </ul>

      {/* footer attribution */}
      <div className="text-xs text-white/50">
        JunoTools 1.0. Copyright &copy; {new Date().getFullYear()} by{' '}
        <Anchor href={links.deuslabs} className="text-plumbus hover:underline">
          deus labs
        </Anchor>
        . All rights reserved.
      </div>

      {/* footer social links */}
      <div className="flex gap-x-6 items-center text-white/75">
        {socialsLinks.map(({ Icon, href, text }) => (
          <Anchor href={href} key={href} className="hover:text-plumbus">
            <Icon aria-label={text} size={20} />
          </Anchor>
        ))}
      </div>
    </SidebarLayout>
  )
}

export default Sidebar
