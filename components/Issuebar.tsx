import clsx from 'clsx'
import { FaAsterisk } from 'react-icons/fa'
import { links } from 'utils/links'

import Anchor from './Anchor'
import Button from './Button'

const Issuebar = () => {
  return (
    <div
      className={clsx(
        'overflow-auto min-w-[250px] max-w-[250px] no-scrollbar',
        'bg-black/50 border-l-[1px] border-l-plumbus-light'
      )}
    >
      <div className="flex flex-col gap-y-4 p-8 min-h-screen">
        <div>This is a beta version of JunoTools.</div>
        <div>We are open for your feedback and suggestions!</div>
        <Anchor href={links.GitHub + '/issues/new'}>
          <Button variant="outline" leftIcon={<FaAsterisk />}>
            Submit an issue
          </Button>
        </Anchor>
      </div>
    </div>
  )
}

export default Issuebar
