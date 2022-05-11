import type { LinkTabProps } from './LinkTab'

export const cw20LinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Create a new CW20 contract`,
    href: '/contracts/cw20/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries with your CW20 contract`,
    href: '/contracts/cw20/query',
  },
  {
    title: 'Execute',
    description: `Execute CW20 contract actions`,
    href: '/contracts/cw20/execute',
  },
]

export const cw1SubkeysLinkTabs: LinkTabProps[] = [
  {
    title: 'Instantiate',
    description: `Create a new CW1 Subkeys contract`,
    href: '/contracts/cw1/subkeys/instantiate',
  },
  {
    title: 'Query',
    description: `Dispatch queries with your CW1 Subkeys contract`,
    href: '/contracts/cw1/subkeys/query',
  },
  {
    title: 'Execute',
    description: `Execute CW1 Subkeys contract actions`,
    href: '/contracts/cw1/subkeys/execute',
  },
]
