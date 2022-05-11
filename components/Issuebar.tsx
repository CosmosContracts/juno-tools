import clsx from 'clsx'
import { Anchor } from 'components/Anchor'
import { Button } from 'components/Button'
import { toggleSidebar, useSidebarStore } from 'contexts/sidebar'
import { FaChevronRight } from 'react-icons/fa'
import { FiLink2 } from 'react-icons/fi'
import { links } from 'utils/links'

export const Issuebar = () => {
  const { isOpen } = useSidebarStore()

  return (
    <div className={clsx(isOpen ? 'min-w-[230px] max-w-[230px]' : 'min-w-[20px] max-w-[20px]', 'relative z-10')}>
      <div
        className={clsx(
          'overflow-auto min-w-[230px] max-w-[230px] no-scrollbar',
          'bg-black/50 border-l-[1px] border-l-plumbus-light',
        )}
      >
        <div className="flex flex-col gap-y-4 p-6 pt-8 min-h-screen">
          <div>This is a beta version of JunoTools.</div>
          <div>We are open for your feedback and suggestions!</div>
          <Anchor href={`${links.GitHub}/issues/new/choose`}>
            <Button rightIcon={<FiLink2 />} variant="outline">
              Submit an issue
            </Button>
          </Anchor>
        </div>
      </div>

      {/* sidebar toggle */}
      <button
        className={clsx(
          'absolute top-[32px] left-[-12px] p-1 w-[24px] h-[24px]',
          'text-black bg-plumbus-light rounded-full',
          'hover:bg-plumbus',
        )}
        onClick={toggleSidebar}
      >
        <FaChevronRight className={clsx('mx-auto', { 'rotate-180': !isOpen })} size={12} />
      </button>
    </div>
  )
}
