import create from 'zustand'

export const useSidebarStore = create(() => ({ isOpen: true }))

export const openSidebar = () => {
  useSidebarStore.setState({ isOpen: true })
}
export const closeSidebar = () => {
  useSidebarStore.setState({ isOpen: false })
}
export const toggleSidebar = () => {
  useSidebarStore.setState((prev) => ({ isOpen: !prev.isOpen }))
}
