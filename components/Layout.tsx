import { ReactNode } from 'react'
import Head from 'next/head'
import Sidebar from './Sidebar'

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-screen relative overflow-hidden juno-gradient-bg text-white">
      <Head>
        <title>JunoTools</title>
        <meta name="description" content="Tooling dApp for Juno Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/confetti.svg"
        alt="plumbus confetti"
        className="absolute pointer-events-none h-[calc(100vh+180px)] top-0 right-0"
      />

      <div className="h-full flex z-10">
        <Sidebar />
        <main className="flex-grow flex flex-col items-center justify-center">
          {children}
          {/*  */}
        </main>
      </div>
    </div>
  )
}

export default Layout
