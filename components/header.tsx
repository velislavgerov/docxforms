import { useSession } from 'next-auth/client'
import Link from 'next/link'

export default function Header() {
  const [ session, loading ] = useSession()

  return (
    <header className="pb-3 py-4 mb-4 border-bottom">
      <div className="d-grid gap-3 align-items-center" style={{ gridTemplateColumns: '1fr 2fr'}}>
        <Link href="/">
          <a className="d-flex align-items-center text-dark text-decoration-none">
            <span className="fs-4"><span className="text-primary">.docx</span>forms</span>
          </a>
        </Link>

        {session && <div className="d-flex align-items-center justify-content-end">
          <div className="flex-shrink-0">
            <img src={session.user?.image} alt="mdo" className="rounded-circle" width="32" height="32" />
          </div>
        </div>}
      </div>
    </header>
  )
}