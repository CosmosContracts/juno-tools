import clsx from 'clsx'
import Head from 'next/head'
import type { ReactNode } from 'react'
import { FaDesktop } from 'react-icons/fa'
import type { PageMetadata } from 'utils/layout'

import { DefaultAppSeo } from './DefaultAppSeo'
// import { Issuebar } from './Issuebar'

export interface LayoutProps {
  metadata?: PageMetadata
  children: ReactNode
}

export const Layout = ({ children, metadata = {} }: LayoutProps) => {
  return (
    <div className="overflow-hidden relative">
      <Head>
        <meta content="minimum-scale=1, initial-scale=1, width=device-width" name="viewport" />
      </Head>

      <DefaultAppSeo />

      {/* plumbus confetti */}
      <div className="fixed inset-0 -z-10 pointer-events-none juno-gradient-bg">
        <img alt="plumbus confetti" className="fixed top-0 right-0 h-[calc(100vh+180px)]" src="/confetti.svg" />
      </div>

      {/* actual layout container */}
      <div className="sm:flex">
        <div className="overflow-auto relative flex-grow h-screen no-scrollbar">
          <main
            className={clsx('mx-auto max-w-7xl', {
              'flex flex-col justify-center items-center':
                typeof metadata.center === 'boolean' ? metadata.center : true,
            })}
          >
            {children}
          </main>
        </div>
        {/* <Issuebar /> */}
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
