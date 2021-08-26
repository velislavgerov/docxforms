import React from 'react'
import Link from 'next/link'

import { signIn, signOut, useSession } from 'next-auth/client'
import Features from '../components/features'
import Layout from '../components/layout'

export default function Home() {
  const [session, loading] = useSession()

  return (
    <Layout>
      <div className="px-4 py-3 my-3 text-center">
        <Link href="/">
          <a className="text-dark text-decoration-none">
            <span className="display-5 fw-bold">Welcome to <span className="text-primary">.docx</span>forms!</span>
          </a>
        </Link>
        <p className="lead">Create web forms to fill documents with variable content online.</p>
        {!session && <button type="button" className="btn btn-link" onClick={() => signIn()}>Sign in to get started</button>}
        {session && <>
          <Link href="/documents" passHref>
            <button type="button" className="btn btn-outline-primary">My Documents</button>
          </Link>
        </>}
      </div >
      <Features />
    </Layout >
  )
}
