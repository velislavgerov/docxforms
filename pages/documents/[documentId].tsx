import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import Header from '../../components/header'
import useDocumentTemplate from '../../lib/hooks/use-document'
import { deleteDocumentTemplate, downloadDocumentTemplate } from '../../lib/hooks/use-documents'
import DocumentForms from '../../components/document-forms'
import DocumentSubmissions from '../../components/document-submissions'

export default function Document() {
  const router = useRouter()
  const [session, loading] = useSession()

  const { query } = router
  const documentId = query.documentId as string

  const { documentTemplate } = useDocumentTemplate(documentId, session)

  const handleDelete = () => {
    if (documentTemplate == null) return

    deleteDocumentTemplate(documentTemplate.id)
      .then(() => router.push('/documents'))
  }

  const handleDownload = () => {
    if (documentTemplate == null) return

    downloadDocumentTemplate(documentTemplate.id)
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <Layout><AccessDenied /></Layout> }

  // If session exists, display content
  return (
    <div className="container">
      <Header />
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/"><a>Home</a></Link></li>
          <li className="breadcrumb-item active"><Link href="/documents"><a>Documents</a></Link></li>
          <li className="breadcrumb-item active" aria-current="page">
            {!documentTemplate && 'Loading...'}
            {documentTemplate && documentTemplate.name}
          </li>
        </ol>
      </nav>
      {documentTemplate != null && <>
        <h1 className="display-5">
          {documentTemplate.name}
        </h1>
        <div className="d-grid gap-2 d-sm-flex">
          <button type="button" className="btn btn-warning flex-grow-1" onClick={handleDownload}>Download</button>
          <button type="button" className="btn btn-dark flex-grow-1" onClick={handleDelete}>Delete</button>
        </div>
        <div className="py-4">
          <DocumentForms documentTemplateId={documentTemplate.id} />
        </div>
        <div className="py-4">
          <DocumentSubmissions documentTemplateId={documentTemplate.id} />
        </div>
      </>}
    </div>
  )
}
