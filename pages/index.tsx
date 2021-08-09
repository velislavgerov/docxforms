import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import { signIn, signOut, useSession } from 'next-auth/client'

export default function Home() {
  const [session, loading] = useSession()

  return (
    <div className="d-flex flex-column h-100">
      <Head>
        <title>.docxforms</title>
        <meta name="description" content="Create web forms to fill Microsoft Word documents" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex-shrink-0">
        <div className="px-4 py-5 my-5 text-center">
          <Link href="/">
            <a className="text-dark text-decoration-none">
              <span className="display-1"><span className="text-primary">.docx</span>forms</span>
            </a>
          </Link>
          {loading ? (
            <div className="col-lg-6 mx-auto">
              <p className="lead mb-4">
                Loading...
              </p>
            </div>
          ) : (
            <div className="col-lg-6 mx-auto">
              <p className="lead mb-4">
                {!session ? (
                  <p>Please sign in to get started</p>
                ) : (
                  <p>Signed in as {session.user!.email}</p>
                )}
              </p>
              <div className="gap-2 d-sm-flex justify-content-sm-center">
                {!session && <button type="button" className="btn btn-outline-primary" onClick={() => signIn()}>Sign in</button>}
                {session && <>
                  <Link href="/documents" passHref>
                    <button type="button" className="btn btn-outline-primary">Documents</button>
                  </Link>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => signOut()}>Sign out</button>
                </>}
              </div>
            </div>)}
        </div>
      </main>

      <footer className="footer mt-auto py-3 text-center">
        <div className="container">
          <a
            href="https://gerov.dev"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="text-muted">&copy;2021, gerov.dev</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
