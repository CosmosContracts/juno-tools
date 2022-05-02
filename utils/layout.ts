import type { ComponentType } from 'react'

export interface PageMetadata extends Record<string, unknown> {
  center?: boolean
}

export const getComponentMetadata = (Component: any) => {
  return Component.metadata as PageMetadata
}

export const withMetadata = (element: ComponentType<any>, metadata: PageMetadata) => {
  return Object.assign(element, { metadata })
}
