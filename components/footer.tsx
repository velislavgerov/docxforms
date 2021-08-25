import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer mt-auto py-3 text-center">
      <div className="container">
        <Link href="https://gerov.dev">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="link-secondary"
          >
            &copy;2021, gerov.dev
          </a>
        </Link>
      </div>
    </footer>
  )
}
