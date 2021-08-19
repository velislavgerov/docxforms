import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'
import { Button } from 'react-bootstrap'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import Header from '../../components/header'
import Confirm, { ConfirmProps } from '../../components/confirm'
import EditForm, { EditFormProps } from '../../components/edit-form'
import PreviewForm, { PreviewFormProps } from '../../components/preview-form'
import useDocumentForms from '../../lib/hooks/use-document-forms'
import useDocumentTemplate from '../../lib/hooks/use-document'

function Forms({ documentId }: { documentId: string }) {
  const { forms, updateForm, deleteForm } = useDocumentForms(documentId);

  const [confirm, setConfirm] = useState<null | ConfirmProps>(null);
  const [editForm, setEditForm] = useState<null | EditFormProps>(null);
  const [previewForm, setPreviewForm] = useState<null | PreviewFormProps>(null);

  const handlePreview = (form) => {
    setPreviewForm({
      show: true,
      onCancel: () => setPreviewForm(null),
      form,
    })
  }

  const handleEdit = (form) => {
    setEditForm({
      show: true,
      onCancel: () => setEditForm(null),
      onSave: ({ formId, schema, uiSchema }) => updateForm(formId, { schema, uiSchema })
        .then(() => setEditForm(null)),
      form,
    })
  }

  const handleDelete = (form) => {
    const deleteBtn = <Button
      variant="dark"
      onClick={() => deleteForm(form.id)
        .then(() => setConfirm(null))
      }
    >
      Delete
    </Button>

    setConfirm({
      show: true,
      title: 'Confirmation Required',
      body: 'This action is irreversible. Are you sure you want to delete this form?',
      actionBtn: deleteBtn,
      onCancel: () => setConfirm(null),
    })
  }

  if (forms == null) {
    return (
      <p className="lead mb-4">
        Loading...
      </p>
    )
  }

  if (!forms.length) {
    return (
      <div className="alert alert-light" role="alert">
        No forms created for this document template.
      </div>
    )
  }

  return (
    <>
      {confirm && <Confirm {...confirm} />}
      {editForm && <EditForm {...editForm} />}
      {previewForm && <PreviewForm {...previewForm} />}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Visibility</th>
              <th scope="col">URL</th>
              <th scope="col">Created at</th>
              <th scope="col">Updated at</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form: any) => (
              <tr key={form.id}>
                <td>{form.schema.title}</td>
                <td>{form.schema.description}</td>
                <td>Private</td>
                <td>
                  <Link href={`/f/${form.id}`}>
                    <a target="_blank" rel="noopener noreferrer">/f/{form.id}</a>
                  </Link>
                </td>
                <td>{form.createdAt}</td>
                <td>{form.updatedAt}</td>
                <td>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => handlePreview(form)}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary flex-grow-1"
                      onClick={() => handleEdit(form)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-dark flex-grow-1"
                      onClick={() => handleDelete(form)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Document() {
  const router = useRouter()
  const [session, loading] = useSession()

  const { query } = router
  const documentId = query.documentId as string

  const { documentTemplate } = useDocumentTemplate(documentId)
  const { createForm } = useDocumentForms(documentId)

  const handleDelete = () => {
    if (documentId == null) return

    axios
      .delete(`/api/documents/${documentId}`)
      .then(() => {
        router.push(`/documents`)
        alert("File Deleted Successfully")
      })
      .catch((err) => {
        console.error(err)
        alert("File Delete Error")
      })
  }

  const handleDownload = () => {
    if (documentId == null) return

    axios({
      method: 'GET',
      url: `/api/documents/${documentId}/file`,
      responseType: 'blob',
    })
      .then((res) => {
        console.log(res)
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');

        let filename = ''
        const disposition = res.headers['content-disposition'];
        // source: https://stackoverflow.com/a/40940790
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          const matches = filenameRegex.exec(disposition)
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '')
          }
        }

        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
      })
      .catch((err) => {
        console.log(err)
        alert("Failed to get document content")
      })
  }

  const fetchForms = () => axios
    .get(`/api/documents/${documentId}/forms`)
    .then((res) => {
      setForms(res.data)
    })
    .catch((err) => {
      console.log(err)
      alert("Failed to load document forms")
    })

  const fetchSubmissions = () => axios
    .get(`/api/documents/${documentId}/submissions`)
    .then((res) => {
      console.log(res.data)
      setSubmissions(res.data)
    })
    .catch((err) => {
      console.log(err)
      alert("Failed to fetch submissions")
    })

  useEffect(() => {
    if (session != null && documentId != null) {

      // fetchForms()
      // fetchSubmissions()
    }
  }, [session, documentId])

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
      <h1 className="display-5">
        {documentTemplate && documentTemplate.name}
      </h1>
      <div className="d-grid gap-2 d-sm-flex">
        <button type="button" className="btn btn-warning flex-grow-1" onClick={handleDownload}>Download</button>
        <button type="button" className="btn btn-dark flex-grow-1" onClick={handleDelete}>Delete</button>
      </div>
      <div className="py-4">
        <div className="d-grid gap-2 d-sm-flex justify-content-between">
          <h2>
            Manage Forms
          </h2>
          <button className="btn btn-outline-dark" type="button"
            onClick={createForm}
          >
            + Add Form
          </button>
        </div>
        <p className="lead">This is a lead paragraph with some useful information about forms.</p>
        {documentTemplate && <Forms documentId={documentTemplate.id} />}
      </div>
    </div>
  )
}
