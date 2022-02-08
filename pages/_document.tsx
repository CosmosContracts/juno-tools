import * as React from 'react'

import NextDocument, { Head, Html, Main, NextScript } from 'next/document'

export default class CustomDocument extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <meta charSet="UTF-8" />
          <meta content="ie=edge" httpEquiv="X-UA-Compatible" />
        </Head>

        <body className="font-sans antialiased">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
