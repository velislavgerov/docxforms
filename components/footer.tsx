import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer mt-auto py-3 text-center border-top">
      <div className="container">
        <Link href="https://gerov.dev">
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="link-secondary"
            style={{ textDecoration: 'none !important' }}
          >
            &copy; 2021 Velislav Gerov
          </a>
        </Link>
      </div>
    </footer>
  )
}
