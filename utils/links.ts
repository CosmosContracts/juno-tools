import { ImGithub, ImTwitter } from 'react-icons/im'
import { SiDiscord, SiTelegram } from 'react-icons/si'

export const links = {
  // main links
  deuslabs: `https://deuslabs.fi`,
  Discord: `https://discord.gg/Juno`,
  Docs: `https://docs.juno.tools`,
  GitHub: `https://github.com/CosmosContracts/juno-tools`,
  Juno: `https://junonetwork.io`,
  Telegram: `https://t.me/JunoNetwork`,
  Twitter: `https://twitter.com/junotools`,
  'UNI Explorer': `https://explorer.uni.chaintools.tech`,

  // reference links
  'Docs Create Airdrop': `https://docs.juno.tools/docs/dashboards/airdrop/guide#create`,
}

export const footerLinks = [
  { text: 'UNI Explorer', href: links['UNI Explorer'] },
  { text: 'Documentation', href: links.Docs },
  { text: 'Powered by Juno', href: links.Juno },
]

export const legacyNavbarLinks = [
  { text: 'Airdrops', href: `/airdrops` },
  { text: 'CW20 - Soon', href: `/contracts/cw20`, disabled: true },
  { text: 'CW1 - Soon', href: `/contracts/cw1`, disabled: true },
  { text: 'CW721 - Soon', href: `/contracts/cw721`, disabled: true },
]

export const socialsLinks = [
  { text: 'Discord', href: links.Discord, Icon: SiDiscord },
  { text: 'GitHub', href: links.GitHub, Icon: ImGithub },
  { text: 'Telegram', href: links.Telegram, Icon: SiTelegram },
  { text: 'Twitter', href: links.Twitter, Icon: ImTwitter },
]
