import React from 'react'
import { signIn, signOut, useSession } from 'next-auth/client'
import Link from 'next/link'
import { Dropdown } from 'react-bootstrap'

export default function Header() {
  const [session] = useSession()

  return (
    <header className="pb-3 py-4 mb-4 border-bottom">
      <div className="d-grid gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <Link href="/">
          <a className="d-flex align-items-center text-dark text-decoration-none">
            <span className="fs-4"><span className="text-primary">.docx</span>forms</span>
          </a>
        </Link>
        <div className="d-flex align-items-center justify-content-end">
          <div className="flex-shrink-0">
            {!session && <button type="button" className="btn btn-outline-primary" onClick={() => signIn()}>Sign in</button>}
            {session &&
              <Dropdown>
                <Dropdown.Toggle id="dropdown-basic" variant="anchor">
                  <img src={session.user?.image == null ? undefined : session.user?.image} alt={session.user?.name == null ? undefined : session.user?.name} className="rounded-circle" width="32" height="32" />
                </Dropdown.Toggle>

                <Dropdown.Menu align="right">
                  <Dropdown.Header>
                    <h5>
                      <strong>{session.user!.name}</strong>
                    </h5>
                    {session.user!.email}
                  </Dropdown.Header>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={
                    () => signOut()
                  }>Sign out</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>}
          </div>
        </div>
      </div>
    </header>
  )
}