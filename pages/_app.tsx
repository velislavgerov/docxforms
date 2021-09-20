/* eslint-disable react/jsx-props-no-spreading */
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

import React from 'react'
import type { AppProps } from 'next/app'

import { Provider } from 'next-auth/client'
import { SWRConfig } from 'swr'
import axios from 'axios'
import Layout from '../components/layout'

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig value={{ fetcher }}>
      <Provider session={pageProps.session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </SWRConfig>
  )
}
