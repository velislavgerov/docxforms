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
                <Dropdown.Toggle id="dropdown-basic" variant="anchor" className="d-flex align-items-center gap-2">
                  <img src={session.user?.image == null ? undefined : session.user?.image} alt="mdo" className="rounded-circle" width="32" height="32" />
                  {session.user!.name}
                </Dropdown.Toggle>

                <Dropdown.Menu align="right">
                  <Dropdown.Header>{session.user!.email}</Dropdown.Header>
                  <Dropdown.Divider />
                  <Link href="/documents" passHref>
                    <Dropdown.Item>Documents</Dropdown.Item>
                  </Link>
                  <Dropdown.Item disabled href="/submissions">Submissions</Dropdown.Item>
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