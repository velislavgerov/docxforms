/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/client'
import { Button } from 'react-bootstrap'

import Layout from './layout'
import AccessDenied from './access-denied'
import Confirm, { ConfirmProps } from './confirm'
import EditForm, { EditFormProps } from './edit-form'
import PreviewForm, { PreviewFormProps } from './preview-form'
import { IForm, IFormUpdateParams } from '../lib/types/api'
import { updateDocumentForm, deleteDocumentForm, createDocumentForm, useDocumentForms } from '../lib/hooks/use-document-forms'

function DocumentForms({ documentTemplateId }: { documentTemplateId: string }) {
  const [session, loading] = useSession()
  const { forms, isLoading, isError } = useDocumentForms(documentTemplateId, session)

  const [confirm, setConfirm] = useState<null | ConfirmProps>(null);
  const [editForm, setEditForm] = useState<null | EditFormProps>(null);
  const [previewForm, setPreviewForm] = useState<null | PreviewFormProps>(null);

  const handlePreview = (form: IForm) => {
    setPreviewForm({
      show: true,
      onCancel: () => setPreviewForm(null),
      form,
    })
  }

  const handleEdit = (form: IForm) => {
    setEditForm({
      show: true,
      onCancel: () => setEditForm(null),
      onSave: (params: IFormUpdateParams) =>
        updateDocumentForm(documentTemplateId, form.id, params)
          .then(() => setEditForm(null)),
      form,
    })
  }

  const handleDelete = (form: IForm) => {
    const deleteBtn = <Button
      variant="dark"
      onClick={() =>
        deleteDocumentForm(documentTemplateId, form.id)
          .then(() => setConfirm(null))
      }
    >
      Delete
    </Button>

    setConfirm({
      show: true,
      title: 'Confirmation Required',
      body: 'This action is irreversible. Are you sure you want to delete this form and all related submissions?',
      actionBtn: deleteBtn,
      onCancel: () => setConfirm(null),
    })
  }

  const handleCreate = () => {
    if (documentTemplateId == null) return

    createDocumentForm(documentTemplateId)
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <Layout><AccessDenied /></Layout> }

  if (forms == null || isLoading) {
    return (
      <p className="lead mb-4">
        Loading document forms...
      </p>
    )
  }

  if (forms == null || isError) {
    return (
      <p className="lead mb-4">
        Unexpected error occured
      </p>
    )
  }

  if (forms != null && !forms.length) {
    return (<>
      <div className="d-grid gap-2 d-sm-flex justify-content-between">
        <h2>
          Manage Forms
        </h2>
        <button className="btn btn-outline-dark" type="button"
          onClick={handleCreate}
        >
          + Add Form
        </button>
      </div>
      <p className="lead">This is a lead paragraph with some useful information about forms.</p>
      <div className="alert alert-light" role="alert">
        No forms created for this document template.
      </div>
    </>)
  }

  return (
    <>
      {confirm && <Confirm {...confirm} />}
      {editForm && <EditForm {...editForm} />}
      {previewForm && <PreviewForm {...previewForm} />}
      <div className="d-grid gap-2 d-sm-flex justify-content-between">
        <h2>
          Manage Forms
        </h2>
        <button className="btn btn-outline-dark" type="button"
          onClick={handleCreate}
        >
          + Add Form
        </button>
      </div>
      <p className="lead">This is a lead paragraph with some useful information about forms.</p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Dedicated URL</th>
              <th scope="col">Visibility</th>
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
                <td>
                  <Link href={`/f/${form.id}`}>
                    <a target="_blank" rel="noopener noreferrer">/f/{form.id}</a>
                  </Link>
                </td>
                <td>Public</td>
                <td>{form.createdAt}</td>
                <td>{form.updatedAt}</td>
                <td>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => handlePreview(form)}
                    >
                      Open
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

export default DocumentForms