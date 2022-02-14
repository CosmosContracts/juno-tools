import clsx from 'clsx'
import { toggleSidebar, useSidebarStore } from 'contexts/sidebar'
import { FaChevronLeft } from 'react-icons/fa'

const SidebarToggle = () => {
  const { isOpen } = useSidebarStore()

  return (
    <button
      className={clsx(
        'absolute top-[32px] right-[-12px] p-1 w-[24px] h-[24px]', // positioning
        'text-black bg-plumbus-light rounded-full', // styling
        'hover:bg-plumbus' // hover styling
      )}
      onClick={toggleSidebar}
    >
      <FaChevronLeft
        size={12}
        className={clsx('mx-auto', { 'rotate-180': !isOpen })}
      />
    </button>
  )
}
export default SidebarToggle
