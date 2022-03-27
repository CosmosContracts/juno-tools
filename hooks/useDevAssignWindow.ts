import { useEffect } from 'react'

export const useDevAssignWindow = (obj: Record<string, unknown>) => {
  useEffect(() => {
    if (!__DEV__) return

    Object.assign(window, obj)
    return () => Object.keys(obj).forEach((k: any) => delete window[k])
  }, [obj])
}
