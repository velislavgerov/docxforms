import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/client'
import Link from 'next/link'
import { Dropdown } from 'react-bootstrap'

export default function Header() {
  const [session, loading] = useSession()

  return (
    <header className="pb-3 pt-4 mb-4 border-bottom">
      <div className="container d-grid gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <Link href="/">
          <a className="d-flex align-items-center text-dark text-decoration-none fw-bold fs-4" translate="no">
            <span>doc</span><span className="text-primary">x</span><span>forms</span>
          </a>
        </Link>
        <div className="d-flex align-items-center justify-content-end">
          <div className="flex-shrink-0">
            {loading &&
              <button className="btn btn-anchor text-primary" type="button" disabled>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
              </button>
            }
            {!loading && !session && <button type="button" className="btn btn-outline-primary" onClick={() => signIn("auth0")}>Sign in</button>}
            {!loading && session &&
              <div className="gap-2 d-flex justify-content-center">
                {/*<Link href="/documents" passHref>
                  <button type="button" className="btn btn-link text-decoration-none">Documents</button>
                </Link>
                <Link href="/submissions" passHref>
                  <button type="button" className="btn btn-link text-decoration-none">Submissions</button>
            </Link>*/}
                <Dropdown>
                  <Dropdown.Toggle id="dropdown-basic" variant="anchor" className="d-flex align-items-center gap-2">
                    <img src={session.user?.image == null ? undefined : session.user?.image} alt="" className="rounded-circle" width="32" height="32" />
                    {session.user!.name}
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="right">
                    <Link href="/documents" passHref>
                      <Dropdown.Item>Documents</Dropdown.Item>
                    </Link>
                    <Dropdown.Item disabled href="/submissions">Submissions</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={
                      () => signOut({
                        callbackUrl: `${window.location.origin}`
                      })
                    }>Sign out</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>}
          </div>
        </div>
      </div>
    </header>
  )
}