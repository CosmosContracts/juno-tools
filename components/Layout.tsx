import Head from 'next/head'
import { ReactNode } from 'react'

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
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="overflow-hidden relative">
      <DefaultSeo />

      {/* plumbus confetti */}
      <div className="absolute top-0 right-0 h-screen pointer-events-none">
        <img
          src="/confetti.svg"
          alt="plumbus confetti"
          className="h-[calc(100vh+180px)]"
        />
      </div>

      {/* actual layout container */}
      <div className="flex items-stretch min-h-screen">
        <Sidebar />
        <main className="flex flex-col flex-grow justify-center items-center">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
