const withTM = require('next-transpile-modules')(['react-syntax-highlighter'])

module.exports = withTM({
  reactStrictMode: true,
  trailingSlash: true,
})
