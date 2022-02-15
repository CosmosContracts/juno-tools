import clsx from 'clsx'
import Head from 'next/head'
import { ReactNode } from 'react'
import { PageMetadata } from 'utils/layout'

import Sidebar from './Sidebar'

const DefaultSeo = () => {
  return (
    <>
      <Head>
        {/* TODO: remove hardcoded title */}
        <title>JunoTools</title>
        <meta
          content="minimum-scale=1, initial-scale=1, width=device-width"
          name="viewport"
        />
        <meta name="description" content="Tooling dApp for Juno Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* TODO: add exhaustive seo defaults */}
    </>
  )
}

export interface LayoutProps {
  metadata?: PageMetadata
  children: ReactNode
}

const Layout = ({ children, metadata = {} }: LayoutProps) => {
  return (
    <div className="overflow-hidden relative">
      <DefaultSeo />

      {/* plumbus confetti */}
      <div className="fixed inset-0 -z-10 pointer-events-none juno-gradient-bg">
        <img
          src="/confetti.svg"
          alt="plumbus confetti"
          className="fixed top-0 right-0 h-[calc(100vh+180px)]"
        />
      </div>

      {/* actual layout container */}
      <div className="flex items-stretch min-h-screen">
        <Sidebar />
        <main
          className={clsx('flex-grow', {
            'flex flex-col justify-center items-center':
              typeof metadata.center == 'boolean' ? metadata.center : true,
          })}
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
