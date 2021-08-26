import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer mt-auto">
      <div className="container py-3 mt-4 text-center border-top">
        <Link href="https://gerov.dev" passHref>
          <a
            target="_blank"
            rel="noopener noreferrer"
            className="link-secondary text-decoration-none"
          >
            &copy; 2021 Velislav Gerov
          </a>
        </Link>
      </div>
    </footer>
  )
}
