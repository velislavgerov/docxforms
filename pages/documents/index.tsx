/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState, SyntheticEvent } from 'react'
import { useSession } from 'next-auth/client'
import Link from 'next/link'
import { Dropdown } from 'react-bootstrap'

import AccessDenied from '../../components/access-denied'
import { useDocumentTemplates, uploadDocumentTemplate, deleteDocumentTemplate, downloadDocumentTemplate, updateDocumentTemplate } from '../../lib/hooks/use-documents'
import { IDocumentTemplate, IDocumentTemplateUpdateParams } from '../../lib/types/api'
import EditDocument, { EditDocumentProps } from '../../components/edit-document'
import useConfirm from '../../lib/hooks/use-confirm'

export default function Documents() {
  const [session, loading] = useSession()
  const { documentTemplates } = useDocumentTemplates(session)
  const { confirm, ConfirmComponent } = useConfirm()

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

  const handleDelete = async (doc: IDocumentTemplate) => {
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
      {ConfirmComponent}
      {editDocument && <EditDocument {...editDocument} />}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/"><a>Home</a></Link></li>
          <li className="breadcrumb-item active" aria-current="page">Documents</li>
        </ol>
      </nav>
      <div className="pb-2 gap-2 d-grid d-sm-flex justify-content-between align-items-center">
        <h1 className="display-5">
          Documents
        </h1>
        <form>
          <label htmlFor="docxFile" className="btn btn-outline-dark"><i className="bi bi-upload" /> Upload .docx</label>
          <input hidden className="form-control" type="file" id="docxFile" onChange={handleFileInput} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        </form>
      </div>
      {(documentTemplates != null && documentTemplates.length) ?
        (<div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Description</th>
                <th scope="col">Last modified</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documentTemplates.map((doc: IDocumentTemplate) => (
                <Link key={doc.id} href={`/documents/${doc.id}`} passHref>
                  <tr style={{ cursor: 'pointer' }}>
                    <td><i className="bi bi-file-earmark-word" /> {doc.name}
                    </td>
                    <td>{doc.description}</td>
                    <td>{new Date(doc.updatedAt).toLocaleString('en-EU')}</td>
                    <td>
                      <Dropdown onClick={(e: any) => e.preventDefault()}>
                        <Dropdown.Toggle variant="anchor" className="d-flex align-items-center gap-2">
                          <i className="bi bi-three-dots-vertical" />
                        </Dropdown.Toggle>

                        <Dropdown.Menu align="right" popperConfig={{ strategy: "fixed" }}>
                          <Dropdown.Item onClick={() => handleEdit(doc)}><i className="bi bi-pencil-square" /> Edit</Dropdown.Item>
                          <Link
                            passHref
                            href={`https://view.officeapps.live.com/op/embed.aspx?src=${doc.fileUrl}`}
                          >
                            <Dropdown.Item
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <i className="bi bi-zoom-in" /> View
                            </Dropdown.Item>
                          </Link>
                          <Dropdown.Item onClick={() => handleDownload(doc)}><i className="bi bi-file-earmark-arrow-down" /> Download</Dropdown.Item>
                          <Dropdown.Item onClick={() => handleDelete(doc)}><i className="bi bi-trash" /> Delete</Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
        ) : (
          <div className="alert alert-light" role="alert">
            No files uploaded. To get started please select a .docx!
          </div>
        )
      }
    </>
  )
}