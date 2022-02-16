import clsx from 'clsx'
import { toggleSidebar, useSidebarStore } from 'contexts/sidebar'
import { PropsWithChildren } from 'react'
import { FaChevronLeft } from 'react-icons/fa'

const SidebarLayout = ({ children }: PropsWithChildren<{}>) => {
  const { isOpen } = useSidebarStore()

  return (
    <div
      className={clsx(
        isOpen ? 'min-w-[250px] max-w-[250px]' : 'min-w-[20px] max-w-[20px]',
        'relative z-10'
      )}
    >
      {/* fixed component */}
      <div
        className={clsx(
          'overflow-auto fixed top-0 left-0 min-w-[250px] max-w-[250px] no-scrollbar',
          'bg-black/50 border-r-[1px] border-r-plumbus-light',
          { 'translate-x-[-230px]': !isOpen }
        )}
      >
        {/* inner component */}
        <div
          className={clsx('flex flex-col gap-y-4 p-8 min-h-screen', {
            invisible: !isOpen,
          })}
        >
          {children}
        </div>
      </div>

      {/* sidebar toggle */}
      <button
        className={clsx(
          'absolute top-[32px] right-[-12px] p-1 w-[24px] h-[24px]',
          'text-black bg-plumbus-light rounded-full',
          'hover:bg-plumbus'
        )}
        onClick={toggleSidebar}
      >
        <FaChevronLeft
          size={12}
          className={clsx('mx-auto', { 'rotate-180': !isOpen })}
        />
      </button>
    </div>
  )
}

export default SidebarLayout
