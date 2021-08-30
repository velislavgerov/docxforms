import React from 'react'
import Footer from './footer'
import Header from './header'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="container h-100">{children}</main>
      <Footer />
    </div>
  )
}