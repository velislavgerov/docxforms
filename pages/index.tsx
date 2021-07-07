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
      </Head>

      <>
        {!session && <>
          Not signed in <br/>
          <button onClick={() => signIn()}>Sign in</button>
        </>}
        {session && <>
          Signed in as {session.user!.email} <br/>
          <button onClick={() => signOut()}>Sign out</button>
        </>}
      </>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <span>.docx</span>forms
        </h1>

        <p className={styles.description}>
        Create web forms to fill Microsoft Word documents
        </p>

        <div className={styles.grid}>
          <Link href="/register">
            <a className={styles.card}>
              <h2>Register &rarr;</h2>
              <p>Create an account to get started.</p>
            </a>
          </Link>

          <Link href="/login">
            <a className={styles.card}>
              <h2>Login &rarr;</h2>
              <p>If you already have an account.</p>
            </a>
          </Link>

          <Link href="/examples">
            <a className={styles.card}>
              <h2>Explore &rarr;</h2>
              <p>See example use cases.</p>
            </a>
          </Link>

          <Link href="/pricing">
            <a className={styles.card}>
              <h2>Pricing &rarr;</h2>
              <p>
                Check out our offering.
              </p>
            </a>
          </Link>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://gerov.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy;2021, gerov.dev
        </a>
      </footer>
    </div>
  )
}
