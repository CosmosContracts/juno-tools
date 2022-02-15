import create from 'zustand'
import { persist } from 'zustand/middleware'

export const useSidebarStore = create(
  persist(() => ({ isOpen: true }), { name: 'juno-tools-sidebar', version: 1 })
)

export const openSidebar = () => {
  useSidebarStore.setState({ isOpen: true })
}
export const closeSidebar = () => {
  useSidebarStore.setState({ isOpen: false })
}
export const toggleSidebar = () => {
  useSidebarStore.setState((prev) => ({ isOpen: !prev.isOpen }))
}
