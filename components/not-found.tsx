import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="text-center">
      <h1 className="display-5 fw-bold">404</h1>
      <h5 className="lead">Sorry, this page could not be found.</h5>
      <button type="button" className="btn btn-link mr-2" onClick={() => window.history.back()}>Go back?</button>
      <Link href="/" passHref><button type="button" className="btn btn-link mr-2">Go to home?</button></Link>
    </div>
  )
}