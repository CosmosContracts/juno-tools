import { meta } from 'config/meta'
import { useRouter } from 'next/router'
import { DefaultSeo } from 'next-seo'
import { WEBSITE_URL } from 'utils/constants'

export const DefaultAppSeo = () => {
  const router = useRouter()

  return (
    <DefaultSeo
      canonical={meta.url + (router.asPath || '')}
      defaultTitle={meta.name}
      description={meta.description}
      openGraph={{
        title: meta.name,
        description: meta.description,
        type: 'website',
        site_name: meta.name,
        images: [{ url: `${WEBSITE_URL}/social.png` }],
      }}
      titleTemplate={`%s | ${meta.name}`}
      twitter={{
        cardType: 'summary_large_image',
        handle: meta.twitter.username,
        site: meta.twitter.username,
      }}
    />
  )
}
