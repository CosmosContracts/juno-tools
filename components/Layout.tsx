import { ReactNode } from 'react'
import Head from 'next/head'
import Sidebar from './Sidebar'
import { useTheme } from 'contexts/theme'

const Layout = ({ children }: { children: ReactNode }) => {
  const theme = useTheme()

  return (
    <div
      className={`h-screen ${theme.isDarkTheme ? 'bg-dark' : 'bg-white'} ${
        theme.isDarkTheme ? 'text-gray/75' : 'text-dark-gray/75'
      }`}
    >
      <Head>
        <title>JunoTools</title>
        <meta name="description" content="Tooling dApp for Juno Network" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="h-full">
        <div className="h-full flex">
          <Sidebar />
          <div className="flex justify-center items-center h-full w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Layout
