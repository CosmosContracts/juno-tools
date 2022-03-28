import clsx from 'clsx'
import Head from 'next/head'
import { ReactNode } from 'react'
import { FaDesktop } from 'react-icons/fa'
import { PageMetadata } from 'utils/layout'

import DefaultAppSeo from './DefaultAppSeo'
import Sidebar from './Sidebar'

export interface LayoutProps {
  metadata?: PageMetadata
  children: ReactNode
}

const Layout = ({ children, metadata = {} }: LayoutProps) => {
  return (
    <div className="overflow-hidden relative">
      <Head>
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
      </Head>

      <DefaultAppSeo />

      {/* plumbus confetti */}
      <div className="fixed inset-0 -z-10 pointer-events-none juno-gradient-bg">
        <img
          src="/confetti.svg"
          alt="plumbus confetti"
          className="fixed top-0 right-0 h-[calc(100vh+180px)]"
        />
      </div>

      {/* actual layout container */}
      <div className="hidden sm:flex">
        <Sidebar />
        <main
          className={clsx(
            'overflow-auto relative mx-auto w-full max-w-7xl h-screen',
            {
              'flex flex-col justify-center items-center':
                typeof metadata.center == 'boolean' ? metadata.center : true,
            }
          )}
        >
          {children}
        </main>
      </div>

      <div className="flex flex-col justify-center items-center p-8 space-y-4 h-screen text-center bg-black/50 sm:hidden">
        <FaDesktop size={48} />
        <h1 className="text-2xl font-bold">Unsupported Viewport</h1>
        <p>
          JunoTools is best viewed on the big screen.
          <br />
          Please open JunoTools on your tablet or desktop browser.
        </p>
      </div>
    </div>
  )
}

export default Layout
