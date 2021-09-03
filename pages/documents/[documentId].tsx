import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'

import AccessDenied from '../../components/access-denied'
import useDocumentTemplate from '../../lib/hooks/use-document'
import { deleteDocumentTemplate, downloadDocumentTemplate } from '../../lib/hooks/use-documents'
import DocumentForms from '../../components/document-forms'
import DocumentSubmissions from '../../components/document-submissions'
import useConfirm from '../../lib/hooks/use-confirm'

export default function Document() {
  const router = useRouter()
  const [session, loading] = useSession()

  const { query } = router
  const documentId = query.documentId as string

  const { documentTemplate } = useDocumentTemplate(documentId, session)
  const { confirm, ConfirmComponent } = useConfirm()

  const handleDelete = async () => {
    if (documentTemplate == null) return

    const doc = documentTemplate
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}>Delete</button>
    const isConfirmed = await confirm({
      title: "Are you sure?",
      body: (<p>This action cannot be undone. This will permanently delete the <strong>{doc.name}</strong> document.</p>),
      ActionBtn: DeleteBtn,
    })
    if (isConfirmed) {
      console.log(`Delete document ${doc.name}: confirmed`)
      deleteDocumentTemplate(doc.id)
        .then(() => console.log(`Delete document ${doc.name}: success`))
        .catch((err) => {
          console.log(`Delete document ${doc.name}: failed`, err)
          alert(`Delete document ${doc.name}: failed: failed`)
        })
    } else {
      console.log(`Delete document ${doc.name}: cancelled`)
    }
  }

  const handleDownload = () => {
    if (documentTemplate == null) return

    downloadDocumentTemplate(documentTemplate.id)
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  // If session exists, display content
  return (
    <>
      {ConfirmComponent}
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
        <p className="lead">This is a lead paragraph with some useful information about documents.</p>
        <div className="d-grid gap-2 d-sm-flex">
          <Link
            passHref
            href={`https://view.officeapps.live.com/op/embed.aspx?src=${documentTemplate.fileUrl}`}
          >
            <a
              target="_blank"
              rel="noopener noreferrer"
              type="button"
              className="btn btn-light flex-grow-1"
            >
              Open
            </a>
          </Link>
          <button type="button" className="btn btn-warning flex-grow-1" onClick={handleDownload}>Download</button>
          <button type="button" className="btn btn-dark flex-grow-1" onClick={handleDelete}>Delete</button>
        </div>
        <div className="pt-4">
          <DocumentForms documentTemplateId={documentTemplate.id} />
        </div>
        <div className="pt-4">
          <DocumentSubmissions documentTemplateId={documentTemplate.id} />
        </div>
      </>}
    </>
  )
}
