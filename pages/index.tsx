import React from 'react'
import Link from 'next/link'

import { signIn, useSession } from 'next-auth/client'
import Features from '../components/features'

export default function Home() {
  const [session] = useSession()

  return (
    <>
      <div className="py-3 my-4 text-center">
        <Link href="/">
          <a className="text-dark text-decoration-none">
            <span className="display-5 fw-bold">Welcome to <span className="text-primary">.docx</span>forms!</span>
          </a>
        </Link>
        <p className="lead">Create web forms to fill documents with variable content, online.</p>
        {!session && <button type="button" className="btn btn-link" onClick={() => signIn('auth0')}>Sign in to get started</button>}
        {session && <>
          <Link href="/documents" passHref>
            <button type="button" className="btn btn-outline-primary">My Documents</button>
          </Link>
        </>}
      </div >
      <Features />
    </>
  )
}
