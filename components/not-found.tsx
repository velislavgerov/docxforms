import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="display-5 fw-bold">404</h1>
      <h5 className="lead">Sorry, this page could not be found.</h5>
      <Link href="/"><a>Go to home?</a></Link>
    </div>
  )
}