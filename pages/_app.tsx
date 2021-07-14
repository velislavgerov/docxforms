import 'bootstrap/dist/css/bootstrap.min.css'
import '../styles/globals.css'

import type { AppProps } from 'next/app'

import { Provider } from 'next-auth/client'

export default function App ({ Component, pageProps }: AppProps) {
  return (
    <Provider session={pageProps.session}>
      <Component {...pageProps} />
    </Provider>
  )
}
