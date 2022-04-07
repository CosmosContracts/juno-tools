// @ts-check

const packageJson = require('./package.json')

/**
 * @type {import("next").NextConfig}
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
let nextConfig = {
  env: {
    APP_VERSION: packageJson.version,
    NEXT_PUBLIC_WEBSITE_URL:
      process.env.NODE_ENV == 'development'
        ? `http://localhost:${process.env.PORT || 3000}`
        : process.env.NEXT_PUBLIC_WEBSITE_URL,
  },
  reactStrictMode: true,
  trailingSlash: true,
  webpack(config, { dev, webpack }) {
    // svgr integration
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    })
    // predefined constants
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: dev,
        __PROD__: !dev,
      })
    )
    return config
  },
}

module.exports = nextConfig
