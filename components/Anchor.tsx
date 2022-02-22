import Link from 'next/link'
import {
  AnchorHTMLAttributes,
  ComponentType,
  DetailedHTMLProps,
  Fragment,
} from 'react'

export type AnchorProps<T = HTMLAnchorElement> = DetailedHTMLProps<
  AnchorHTMLAttributes<T>,
  T
>

/**
 * Adaptive link component that can be used for both relative Next.js pages and
 * external links, recommended for sidebar and footer links
 *
 * @see https://nextjs.org/docs/api-reference/next/link
 */
const Anchor = (props: AnchorProps) => {
  const isRelative = props.href?.startsWith('/') ?? false
  const Wrap = (isRelative ? Link : Fragment) as ComponentType

  // if it's a relative link, we need to pass href so it can navigate client-side
  const wrapProps = isRelative ? { href: props.href } : {}

  // if it's an external link, passing the target="_blank" prop will open externally
  const linkProps = !isRelative
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <Wrap {...wrapProps}>
      <a {...props} {...linkProps} />
    </Wrap>
  )
}

export default Anchor
