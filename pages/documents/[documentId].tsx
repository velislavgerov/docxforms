import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'
import { Tabs, Tab, Dropdown } from 'react-bootstrap'

import { toast } from 'react-toastify'

import AccessDenied from '../../components/access-denied'
import useDocumentTemplate from '../../lib/hooks/use-document'
import { deleteDocumentTemplate, downloadDocumentTemplate, updateDocumentTemplate } from '../../lib/hooks/use-documents'
import DocumentForms from '../../components/document-forms'
import DocumentSubmissions from '../../components/document-submissions'
import useConfirm from '../../lib/hooks/use-confirm'
import EditDocument from '../../components/edit-document-modal'
import { IDocumentTemplateUpdateParams } from '../../lib/types/api'

export default function Document() {
  const router = useRouter()
  const [session, loading] = useSession()

  const { query } = router
  const documentId = query.documentId as string

  const { documentTemplate } = useDocumentTemplate(documentId, session)
  const { confirm, ConfirmComponent } = useConfirm()

  const [showEdit, setShowEdit] = useState<boolean>(false);

  const handleSave = (params: IDocumentTemplateUpdateParams) => {
    const updatePromise = updateDocumentTemplate(documentTemplate.id, params)

    updatePromise
      .then(() => {
        console.log(`Saving document ${documentTemplate.name}: success`)
        setEditDocument(null)
      })
      .catch((err) => {
        console.log(`Saving document ${documentTemplate.name}: failed`, err)
      })

    toast.promise(
      updatePromise,
      {
        pending: {
          render: <span>Saving <strong>{documentTemplate.name}</strong>...</span>,
        },
        success: {
          render: <span>Saved <strong>{documentTemplate.name}</strong></span>,
        },
        error: {
          render: <span>Failed to save <strong>{documentTemplate.name}</strong></span>,
        },
      }
    )
  }

  const handleCloseEdit = () => {
    setShowEdit(false)
  }

  const handleEdit = () => {
    setShowEdit(true)
  }

  const handleDelete = async () => {
    if (documentTemplate == null) return

    const doc = documentTemplate
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}><i className="bi bi-trash" /> Delete</button>
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

  const handlePreview = () => {
    if (documentTemplate == null) return

    const w = window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${documentTemplate.fileUrl}`, '_blank');
    if (!w) {
      toast.warn(<span>Could not open preview. Try <a target="_blank" rel="noopener noreferrer" href={`https://view.officeapps.live.com/op/embed.aspx?src=${documentTemplate.fileUrl}`}>clicking</a> here</span>)
    }
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  // If session exists, display content
  return (
    <>
      {ConfirmComponent}
      {documentTemplate != null && <EditDocument
        show={showEdit}
        documentTemplate={documentTemplate}
        onSave={handleSave}
        onCancel={handleCloseEdit}
      />}
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
      {documentTemplate != null &&
        <Tabs fill defaultActiveKey="forms" variant="pills" className="gap-2 mt-4 h5 align-items-center">
          <Tab
            tabClassName="d-flex justify-content-start text-black p-0"
            title={
              <Dropdown>
                <Dropdown.Toggle variant="btn-anchor" className="d-flex align-items-center gap-2 display-5 ">
                  <span className="display-5">
                    <i className="bi bi-file-earmark-word" /> {documentTemplate.name}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu align="right">
                  <Dropdown.Item className="h5" onClick={handleEdit}><i className="bi bi-pen" /> Edit Details</Dropdown.Item>
                  <Dropdown.Item className="h5" onClick={handlePreview}><i className="bi bi-eye" /> Preview</Dropdown.Item>
                  <Dropdown.Item className="h5" onClick={handleDownload}><i className="bi bi-file-earmark-arrow-down" /> Download</Dropdown.Item>
                  <Dropdown.Item className="h5" onClick={handleDelete}><i className="bi bi-trash" /> Delete</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            }
          />
          <Tab eventKey="forms" title="Forms">
            <div className="pt-4 d-flex flex-column mb-4 container">
              <DocumentForms documentTemplateId={documentTemplate.id} />
            </div>
          </Tab>
          <Tab eventKey="submissions" title="Submissions">
            <div className="pt-4 d-flex flex-column container">
              <DocumentSubmissions documentTemplateId={documentTemplate.id} />
            </div>
          </Tab>
        </Tabs>
      }
    </>
  )
}
