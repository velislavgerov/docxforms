import React from 'react'
import { signOut, useSession } from 'next-auth/client'
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

        {session && <div className="d-flex align-items-center justify-content-end">
          <div className="flex-shrink-0">
            <Dropdown>
              <Dropdown.Toggle id="dropdown-basic" variant="anchor">
                <img src={session.user?.image == null ? undefined : session.user?.image} alt="mdo" className="rounded-circle" width="32" height="32" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={
                  () => signOut({
                    callbackUrl: `${window.location.origin}`
                  })
                }>Sign out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>}
      </div>
    </header>
  )
}