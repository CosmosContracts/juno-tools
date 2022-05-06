import Link from 'next/link'
import type { ComponentProps, ComponentType } from 'react'
import { Fragment } from 'react'

export interface AnchorProps extends ComponentProps<'a'> {
  external?: boolean
}

/**
 * Adaptive link component that can be used for both relative Next.js pages and
 * external links, recommended for sidebar and footer links
 *
 * @see https://nextjs.org/docs/api-reference/next/link
 */
export function Anchor({ children, external, href = '', rel = '', ...rest }: AnchorProps) {
  const isApi = href.startsWith('/api')
  const isRelative = href.startsWith('/')
  const isExternal = typeof external === 'boolean' ? external : isApi || !isRelative

  const Wrap = (isExternal ? Fragment : Link) as ComponentType<any>
  const wrapProps = isExternal ? {} : { href }
  const linkProps = isExternal ? { target: '_blank', rel: `noopener noreferrer ${rel}` } : { rel }

  return (
    <Wrap {...wrapProps}>
      <a {...rest} {...linkProps} href={href}>
        {children ?? (href ? trimHttp(href) : null)}
      </a>
    </Wrap>
  )
}

function trimHttp(str: string) {
  return str.replace(/https?:\/\//, '')
}
