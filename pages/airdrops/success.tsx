import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import type { NextPage } from 'next'
import Script from 'next/script'
import { NextSeo } from 'next-seo'
import { FaAsterisk, FaCheckCircle } from 'react-icons/fa'

const SuccessAirdropPage: NextPage = () => {
  return (
    <>
      <NextSeo title="Success 🎉" />

      <section className="flex flex-col justify-center items-center space-y-4 max-w-xl text-center">
        <FaCheckCircle className="text-plumbus" size={96} />
        <br />
        <h1 className="text-4xl font-bold">Airdrop created and funded!</h1>
        <p className="text-lg">
          Successfully created and funded your airdrop.
          <br />
          You can view your airdrop in the airdrops list page.
        </p>
        <br />
        <Anchor
          className={clsx(
            'flex items-center py-2 px-8 space-x-2 font-bold bg-plumbus-50 hover:bg-plumbus-40 rounded',
            'transition hover:translate-y-[-2px]',
          )}
          href="/airdrops"
        >
          <FaAsterisk />
          <span>Open Airdrops List</span>
        </Anchor>
      </section>

      <Script
        onLoad={() => {
          window.confetti?.({
            origin: { x: 0, y: 0.5 },
            particleCount: 250,
            spread: 500,
          })
          window.confetti?.({
            origin: { x: 1, y: 0.5 },
            particleCount: 250,
            spread: 500,
          })
        }}
        src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js"
      />
    </>
  )
}

export default SuccessAirdropPage
