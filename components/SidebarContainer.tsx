import clsx from 'clsx'
import { useSidebarStore } from 'contexts/sidebar'
import { PropsWithChildren } from 'react'

const SidebarContainer = ({ children }: PropsWithChildren<{}>) => {
  const { isOpen } = useSidebarStore()

  return (
    <div className="overflow-scroll h-screen">
      <div
        className={clsx('flex flex-col gap-y-4 p-8 min-h-screen', {
          invisible: !isOpen,
        })}
      >
        {children}
        {/*  */}
      </div>
    </div>
  )
}

export default SidebarContainer
