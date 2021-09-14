import React from 'react'
import Link from 'next/link'

import { signIn, useSession } from 'next-auth/client'

export default function Home() {
  const [session] = useSession()

  return (
    <>
      <div className="py-3 my-4 text-center">
        <Link href="/">
          <a className="text-dark text-decoration-none display-5 fw-bold">
            <span>Web forms to fill </span><span className="text-primary" translate="no">Microsoft Word</span><span> documents.</span>
          </a>
        </Link>
        <p className="lead">Easily create sharable web forms to fill and generate documents with variable content.</p>
        {!session && <div className="gap-2 d-flex justify-content-center">
          <button type="button" className="btn btn-primary" onClick={() => signIn('auth0')}>Get Started</button>
          <Link href="/f/example" passHref>
            <a
              target="_blank"
              rel="noopener noreferrer"
              type="button" className="btn btn-outline-secondary">See Example <i className="bi bi-box-arrow-up-right" /></a>
          </Link>
        </div>}
        {session && <div className="gap-2 d-flex justify-content-center">
          <Link href="/documents" passHref>
            <button type="button" className="btn btn-primary">My Documents</button>
          </Link>
          <Link href="/submissions" passHref>
            <button type="button" className="btn btn-outline-secondary">My Submissions</button>
          </Link>
        </div>}
      </div >
    </>
  )
}
