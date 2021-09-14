/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/client'

import AccessDenied from './access-denied'
import EditForm, { EditFormProps } from './edit-form'
import PreviewForm, { PreviewFormProps } from './preview-form'
import { IForm, IFormUpdateParams } from '../lib/types/api'
import { updateDocumentForm, deleteDocumentForm, createDocumentForm, useDocumentForms } from '../lib/hooks/use-document-forms'
import useConfirm from '../lib/hooks/use-confirm'

function DocumentForms({ documentTemplateId }: { documentTemplateId: string }) {
  const [session, loading] = useSession()
  const { forms, isLoading, isError } = useDocumentForms(documentTemplateId, session)

  const { confirm, ConfirmComponent } = useConfirm();

  const [editForm, setEditForm] = useState<null | EditFormProps>(null);
  const [previewForm, setPreviewForm] = useState<null | PreviewFormProps>(null);

  const handlePreview = (form: IForm) => {
    setPreviewForm({
      show: true,
      onCancel: () => setPreviewForm(null),
      form,
      documentTemplateId,
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

  const handleDelete = async (form: IForm) => {
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}><i className="bi bi-trash" /> Delete</button>
    const isConfirmed = await confirm({
      title: "Are you sure?",
      body: (<p>This action cannot be undone. This will permanently delete the <strong>{form.schema.title}</strong> form and all corresponding submissions.</p>),
      ActionBtn: DeleteBtn,
    })
    if (isConfirmed) {
      console.log(`Delete form ${form.schema.title}: confirmed`)
      deleteDocumentForm(documentTemplateId, form.id)
        .then(() => console.log(`Delete form ${form.schema.title}: success`))
        .catch((err) => {
          console.log(`Delete form ${form.schema.title}: failed`, err)
          alert(`Delete form ${form.schema.title}: failed`)
        })
    } else {
      console.log(`Delete form ${form.schema.title}: cancelled`)
    }
  }

  const handleCreate = () => {
    if (documentTemplateId == null) return

    createDocumentForm(documentTemplateId)
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

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
      <div className="alert alert-light" role="alert">
        No forms created for this document template.
      </div>
      <button className="btn btn-outline-dark" type="button"
        onClick={handleCreate}
      >
        + Add Form
      </button>
    </>)
  }

  return (
    <>
      {ConfirmComponent}
      {editForm && <EditForm {...editForm} />}
      {previewForm && <PreviewForm {...previewForm} />}
      <div className="table-responsive">
        <table className="table">
          <thead className="thead-dark">
            <tr >
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Last modified</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form: any) => (
              <tr key={form.id}>
                <td>{form.schema.title}</td>
                <td>{form.schema.description}</td>
                <td>{new Date(form.updatedAt).toLocaleString('en-EU')}</td>
                <td>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => handlePreview(form)}
                    >
                      <i className="bi bi-pencil-square" /> Fill
                    </button>
                    <Link href={`/f/${form.id}`}>
                      <a className="btn btn-dark flex-grow-1" target="_blank" rel="noopener noreferrer">
                        <i className="bi bi-share" /> Share
                      </a>
                    </Link>
                    <button
                      type="button"
                      className="btn btn-primary flex-grow-1"
                      onClick={() => handleEdit(form)}
                    >
                      <i className="bi bi-pen" /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger flex-grow-1"
                      onClick={() => handleDelete(form)}
                    >
                      <i className="bi bi-trash" /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-outline-dark" type="button"
        onClick={handleCreate}
      >
        <i className="bi bi-plus" /> Add Form
      </button>
    </>
  )
}

export default DocumentForms