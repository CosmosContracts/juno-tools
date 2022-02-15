import clsx from 'clsx'
import { useSidebarStore } from 'contexts/sidebar'
import { PropsWithChildren } from 'react'

const SidebarLayout = ({ children }: PropsWithChildren<{}>) => {
  const { isOpen } = useSidebarStore()

  return (
    <div
      className={clsx(
        isOpen ? 'min-w-[250px] max-w-[250px]' : 'min-w-[20px] max-w-[20px]', // layout width
        'relative z-10' // layout positioning
      )}
    >
      <div
        className={clsx(
          'fixed top-0 left-0', // anchor layout
          'min-w-[250px] max-w-[250px]', // actual sidebar width
          'bg-black/50 border-r-[1px] border-r-plumbus-light', // background and border
          'transition-transform ease-out', // animation transition
          { 'translate-x-[-220px]': !isOpen } // hidden state
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default SidebarLayout
