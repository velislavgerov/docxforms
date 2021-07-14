import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import { signIn, signOut, useSession } from 'next-auth/client'

export default function Home() {
  const [ session, loading ] = useSession()

  return (
    <div className={styles.container}>
      <Head>
        <title>.docxforms</title>
        <meta name="description" content="Create web forms to fill Microsoft Word documents" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="//static2.sharepointonline.com/files/fabric/office-ui-fabric-core/11.0.0/css/fabric.min.css" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span>.docx</span>forms
        </h1>

        {!session ? (
          <p>Please sign in to get started</p>
        ): (
          <p>Signed in as {session.user!.email}</p>
        )}

        <div className={styles.grid}>
          {!session && <button type="button" className="btn btn-outline-primary" onClick={() => signIn()}>Sign in</button>}
          {session && <div className="btn-group"> 
            <Link href="/documents">
              <a type="button" className="btn btn-outline-primary">Documents</a>
            </Link>
            <button type="button" className="btn btn-outline-secondary" onClick={() => signOut()}>Sign out</button>
          </div>}
        </div>
      </main>

      <footer className="footer mt-auto py-3">
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
