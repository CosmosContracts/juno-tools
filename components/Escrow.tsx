import toast from 'react-hot-toast'
import { links } from 'utils/links'

import Anchor from './Anchor'

const ESCROW_ADDRESS = 'junoXXXXXXXXXXXXXXXXXXXXXXX'

const Escrow = () => {
  const addressOnClick = () => {
    navigator.clipboard.writeText(ESCROW_ADDRESS)
    toast('Copied to clipboard!')
  }

  return (
    <div className="flex flex-col items-center text-2xl text-center">
      <div>Your airdrop is waiting for your escrow deposit!</div>
      <div className="my-3">Please send XX juno to the following address:</div>
      <button onClick={addressOnClick}>
        <div
          className="p-3 w-fit font-bold bg-juno rounded-lg border border-juno tooltip tooltip-bottom tooltip-info"
          data-tip="Click to copy"
          data-theme="dark"
        >
          {ESCROW_ADDRESS}
        </div>
      </button>
      <div className="mt-3 text-lg">
        You can read more about the escrow process on our{' '}
        <Anchor href={links.Docs} className="text-plumbus hover:underline">
          documentation
        </Anchor>
      </div>
    </div>
  )
}

export default Escrow
