/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, SyntheticEvent } from 'react'
import { useSession } from 'next-auth/client'
import Link from 'next/link'

import AccessDenied from '../../components/access-denied'
import { useDocumentTemplates, uploadDocumentTemplate, deleteDocumentTemplate, downloadDocumentTemplate, updateDocumentTemplate } from '../../lib/hooks/use-documents'
import { IDocumentTemplate, IDocumentTemplateUpdateParams } from '../../lib/types/api'
import EditDocument, { EditDocumentProps } from '../../components/edit-document'

export default function Documents() {
  const [session, loading] = useSession()
  const { documentTemplates } = useDocumentTemplates(session)

  const [editDocument, setEditDocument] = useState<null | EditDocumentProps>(null);

  const handleEdit = (doc: IDocumentTemplate) => {
    setEditDocument({
      show: true,
      onCancel: () => setEditDocument(null),
      onSave: (params: IDocumentTemplateUpdateParams) =>
        updateDocumentTemplate(doc.id, params)
          .then(() => setEditDocument(null)),
      documentTemplate: doc,
    })
  }

  const handleDelete = (doc: IDocumentTemplate) => {
    deleteDocumentTemplate(doc.id)
      .catch((err) => {
        console.log(err)
        alert("Failed to delete document")
      })
  }

  const handleFileInput = (e: SyntheticEvent) => {
    e.preventDefault()
    const target = e.target as HTMLInputElement
    const selectedFile = target.files![0]

    uploadDocumentTemplate({
      name: selectedFile.name,
      file: selectedFile,
    })
      .then(() => {
        target.value = ''
      })
      .catch((err) => {
        console.log(err)
        alert("Failed to upload document")
      })
  }

  const handleDownload = (doc: IDocumentTemplate) => {
    downloadDocumentTemplate(doc.id)
      .catch((err) => {
        console.log(err)
        alert("Failed to download document")
      })
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  // If session exists, display content
  return (
    <>
      {editDocument && <EditDocument {...editDocument} />}
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
                <th scope="col">Description</th>
                <th scope="col">Added at</th>
                <th scope="col">Last modified at</th>
                <th scope="col" colSpan={4}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentTemplates.map((doc: IDocumentTemplate) => (
                <tr key={doc.id}>
                  <td>
                    <Link href={`/documents/${doc.id}`} passHref>
                      <button type="button" className="btn btn-anchor"><i className="bi bi-file-earmark-word" /> {doc.name}</button>
                    </Link>
                  </td>
                  <td>{doc.description}</td>
                  <td>{new Date(doc.createdAt).toLocaleString('en-EU')}</td>
                  <td>{new Date(doc.updatedAt).toLocaleString('en-EU')}</td>
                  <td>
                    <button type="button" className="btn btn-outline-primary w-100"
                      onClick={() => handleEdit(doc)}
                    >
                      <i className="bi bi-pencil-square" /> Edit
                    </button>
                  </td>
                  <td>
                    <Link
                      passHref
                      href={`https://view.officeapps.live.com/op/embed.aspx?src=${doc.fileUrl}`}
                    >
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        type="button"
                        className="btn btn-outline-secondary w-100"
                      >
                        <i className="bi bi-zoom-in" /> View File
                      </a>
                    </Link>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline-dark w-100" onClick={() => handleDownload(doc)}><i className="bi bi-file-earmark-arrow-down" /> Download File</button>
                  </td>
                  <td>
                    <button type="button" className="btn btn-outline-danger w-100" onClick={() => handleDelete(doc)}><i className="bi bi-trash" /> Delete</button>
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
    </>
  )
}