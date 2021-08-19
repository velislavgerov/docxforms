import React, { SyntheticEvent } from 'react'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import Link from 'next/link'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import Header from '../../components/header'
import useDocumentTemplates from '../../lib/hooks/use-documents'

export default function Documents() {
  const router = useRouter()
  const [session, loading] = useSession()
  const {
    documentTemplates,
    uploadDocumentTemplate,
    updateDocumentTemplate,
    deleteDocumentTemplate,
    downloadDocumentTemplate
  } = useDocumentTemplates()

  const handleFileInput = (e: SyntheticEvent) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement
    const selectedFile = target.files![0]

    uploadDocumentTemplate({
      name: selectedFile.name,
      file: selectedFile,
    })
      .catch((err) => {
        console.log(err)
        alert("Failed to upload document")
      })
  }

  const handleView = (id: string) => {
    router.push(`/f/${id}`)
  }

  const handleEdit = (doc: any) => {
    router.push(`/documents/${doc.id}`)
  }

  const handleDelete = (doc: any) => {
    deleteDocumentTemplate(doc.id)
      .catch((err) => {
        console.log(err)
        alert("Failed to delete document")
      })
  }

  const handleDownload = (doc: any) => {
    downloadDocumentTemplate(doc.id)
      .catch((err) => {
        console.log(err)
        alert("Failed to download document")
      })
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
          <li className="breadcrumb-item active" aria-current="page">Documents</li>
        </ol>
      </nav>
      <div className="pb-2">
        <h1 className="display-5">
          Documents
        </h1>
        <label htmlFor="docxFile" className="form-label">Upload your .docx template to get a web form.</label>
        <input className="form-control" type="file" id="docxFile" onChange={handleFileInput} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
      </div>
      {(documentTemplates != null && documentTemplates.length) ?
        (<div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Created at</th>
                <th scope="col">Updated at</th>
                <th scope="col" colSpan={3}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentTemplates.map((doc) => (
                <tr key={doc.id}>
                  <td scope="row">
                    <Link href={`/documents/${doc.id}`}>
                      <a>{doc.name}</a>
                    </Link>
                  </td>
                  <td>{doc.createdAt}</td>
                  <td>{doc.updatedAt}</td>
                  <td>
                    <button type="button" className="btn btn-light w-100" onClick={() => handleView(doc)}>Open</button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-warning w-100" onClick={() => handleEdit(doc)}>Edit</button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-warning w-100" onClick={() => handleDownload(doc)}>Download</button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-dark w-100" onClick={() => handleDelete(doc)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="alert alert-light" role="alert">
            No files uploaded. To get started please select a .docx!
          </div>
        )}
    </div>
  )
}