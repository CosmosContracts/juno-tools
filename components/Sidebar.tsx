import Brand from 'assets/brand.svg'
import clsx from 'clsx'
import { toggleSidebar, useSidebarStore } from 'contexts/sidebar'
import { useRouter } from 'next/router'
import { PropsWithChildren } from 'react'
import { FaChevronLeft } from 'react-icons/fa'
import { footerLinks, links, socialsLinks } from 'utils/links'

import Anchor from './Anchor'
import WalletLoader from './WalletLoader'

const SidebarToggle = () => {
  const { isOpen } = useSidebarStore()

  return (
    <button
      className={clsx(
        'absolute top-[32px] right-[-12px] p-1 w-[24px] h-[24px]', // positioning
        'text-black bg-plumbus-light rounded-full', // styling
        'hover:bg-plumbus' // hover styling
      )}
      onClick={toggleSidebar}
    >
      <FaChevronLeft
        size={12}
        className={clsx('mx-auto', { 'rotate-180': !isOpen })}
      />
    </button>
  )
}

const SidebarLayout = ({ children }: PropsWithChildren<{}>) => {
  const { isOpen } = useSidebarStore()

  return (
    <div
      className={clsx(
        isOpen ? 'min-w-[250px] max-w-[250px]' : 'min-w-[20px] max-w-[20px]', // layout width
        'relative transition-[min-width,max-width] ease-out' // layout positioning and transition
      )}
    >
      <div
        className={clsx(
          'fixed top-0 left-0', // anchor layout
          'min-w-[250px] max-w-[250px]', // actual sidebar width
          'bg-black/50 border-r-[1px] border-r-plumbus-light', // background and border
          'transition-transform ease-out', // animation transition
          { 'translate-x-[-220px]': !isOpen } // hidden state
        )}
      >
        {children}
      </div>
    </div>
  )
}

const SidebarContainer = ({ children }: PropsWithChildren<{}>) => {
  const { isOpen } = useSidebarStore()

  return (
    <div className="overflow-scroll h-screen">
      <div
        className={clsx('flex flex-col gap-y-4 p-8 min-h-screen', {
          invisible: !isOpen,
        })}
      >
        {children}
        {/*  */}
      </div>
    </div>
  )
}

const routes = [
  { text: 'Airdrops', href: `/airdrops` },
  { text: 'CW1 Tokens', href: `/contracts/cw1` },
  { text: 'CW20 Tokens', href: `/contracts/cw20` },
]

const Sidebar = () => {
  const router = useRouter()

  return (
    <SidebarLayout>
      <SidebarToggle />
      <SidebarContainer>
        {/* juno brand as home button */}
        <Anchor href="/">
          <Brand className="w-24" />
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
        <span className="text-sm">Network: Juno Testnet</span>

        {/* footer reference links */}
        <ul className="text-sm list-disc list-inside">
          {footerLinks.map(({ href, text }) => (
            <li key={href}>
              <Anchor
                href={href}
                className="hover:text-plumbus hover:underline"
              >
                {text}
              </Anchor>
            </li>
          ))}
        </ul>

        {/* footer attribution */}
        <div className="text-xs text-white/50">
          JunoTools 1.0. Copyright &copy; {new Date().getFullYear()} by{' '}
          <Anchor
            href={links.deuslabs}
            className="text-plumbus hover:underline"
          >
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
      </SidebarContainer>
    </SidebarLayout>
  )
}

export default Sidebar
