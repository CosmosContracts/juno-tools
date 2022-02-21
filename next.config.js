// @ts-check

const withTranspileModules = require('next-transpile-modules')

/**
 * @type {import("next").NextConfig}
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
let nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  webpack(config, { dev, webpack }) {
    // svgr integration
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })

    return config
  },
}

// include local modules
nextConfig = withTranspileModules(
  [
    'react-syntax-highlighter',
    //
  ],
  {
    debug: Boolean(process.env.DEBUG),
  }
)(nextConfig)

module.exports = nextConfig
