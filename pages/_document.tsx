import React from 'react'
import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return initialProps
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=1" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=1" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=1" />
          <link rel="manifest" href="/site.webmanifest?v=1" />
          <link rel="mask-icon" href="/safari-pinned-tab.svg?v=1" color="#000000" />
          <link rel="shortcut icon" href="/favicon.ico?v=1" />
          <meta name="apple-mobile-web-app-title" content="docxforms" />
          <meta name="application-name" content="docxforms" />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="theme-color" content="#ffffff" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
