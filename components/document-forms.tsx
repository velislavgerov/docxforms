/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/client'
import { toast } from 'react-toastify'

import AccessDenied from './access-denied'
import EditForm, { EditFormProps } from './edit-form'
import PreviewForm, { PreviewFormProps } from './preview-form'
import { IForm, IFormUpdateParams } from '../lib/types/api'
import { updateDocumentForm, deleteDocumentForm, createDocumentForm, useDocumentForms } from '../lib/hooks/use-document-forms'
import useConfirm from '../lib/hooks/use-confirm'
import getServerURL from '../lib/utils/server'

// return a promise
function copyToClipboard(textToCopy: string) {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method'
    return navigator.clipboard.writeText(textToCopy);
  }

  // text area method
  const textArea: HTMLTextAreaElement = document.createElement("textarea");
  textArea.value = textToCopy;
  // make the textarea out of viewport
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  return new Promise<void>((res, rej) => {
    // here the magic happens
    // eslint-disable-next-line no-unused-expressions
    document.execCommand('copy') ? res() : rej();
    textArea.remove();
  });
}

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

  const handleUpdate = async (form: IForm, params: IFormUpdateParams) => {
    const updatePromise = updateDocumentForm(documentTemplateId, form.id, params)

    updatePromise
      .then(() => {
        console.log(`Saving document ${form.schema.title}: success`)
        setEditForm(null)
      })
      .catch((err) => {
        console.log(`Saving document ${form.schema.title}: failed`, err)
      })

    toast.promise(
      updatePromise,
      {
        pending: {
          render: <span>Saving <strong>{form.schema.title}</strong>...</span>,
        },
        success: {
          render: <span>Saved <strong>{form.schema.title}</strong></span>,
        },
        error: {
          render: <span>Failed to save <strong>{form.schema.title}</strong></span>,
        },
      }
    )
  }

  const handleEdit = (form: IForm) => {
    setEditForm({
      show: true,
      onCancel: () => setEditForm(null),
      onSave: (params: IFormUpdateParams) => handleUpdate(form, params),
      form,
    })
  }

  const handleDelete = async (form: IForm) => {
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}>Delete</button>
    const isConfirmed = await confirm({
      title: "Are you sure?",
      body: (<p>This action cannot be undone. This will permanently delete the <strong>{form.schema.title}</strong> form and all corresponding submissions.</p>),
      ActionBtn: DeleteBtn,
    })
    if (isConfirmed) {
      console.log(`Delete form ${form.schema.title}: confirmed`)

      const deletePromise = deleteDocumentForm(documentTemplateId, form.id)

      deletePromise
        .then(() => {
          console.log(`Delete form ${form.schema.title}: confirmed`)
        })
        .catch((err) => {
          console.log(`Delete form ${form.schema.title}: failed`, err)
        })

      toast.promise(
        deletePromise,
        {
          pending: {
            render: <span>Deleting <strong>{form.schema.title}</strong>...</span>,
          },
          success: {
            render: <span>Deleted <strong>{form.schema.title}</strong></span>,
          },
          error: {
            render: <span>Failed to delete <strong>{form.schema.title}</strong></span>,
          },
        }
      )
    } else {
      console.log(`Delete form ${form.schema.title}: cancelled`)
    }
  }

  const handleCreate = () => {
    if (documentTemplateId == null) return

    const createPromise = createDocumentForm(documentTemplateId)

    toast.promise(
      createPromise,
      {
        pending: {
          render: <span>Adding <strong>New Form</strong>...</span>,
        },
        success: {
          render: <span>Added <strong>New Form</strong></span>,
        },
        error: {
          render: <span>Cloud not add <strong>New Form</strong></span>,
        },
      }
    )
  }

  const handleShare = (form: IForm) => {
    const url = getServerURL(`/f/${form.id}`)
    const sharePromise = copyToClipboard(url)

    toast.promise(
      sharePromise,
      {
        pending: {
          render: <span>Copying <Link href={`/f/${form.id}`}><a target="_blank" rel="noopener noreferrer">link</a></Link> to clipboard...</span>,
        },
        success: {
          render: <span>Copied <Link href={`/f/${form.id}`}><a target="_blank" rel="noopener noreferrer">link</a></Link> to clipboard</span>,
        },
        error: {
          render: <span>Cloud not copy url to clipboard, please use this <Link href={`/f/${form.id}`}><a target="_blank" rel="noopener noreferrer">link</a></Link></span>,
        },
      }
    )

  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  if (forms == null || isLoading) {
    return (
      <p className="alert alert-light lead" role="alert">
        Loading document forms...
      </p>
    )
  }

  if (forms == null || isError) {
    return (
      <p className="alert alert-danger lead" role="alert">
        Unexpected error occured
      </p>
    )
  }

  if (forms != null && !forms.length) {
    return (<>
      <div className="alert alert-warning lead" role="alert">
        No forms have been created for this document.
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
                    <button
                      type="button"
                      className="btn btn-dark flex-grow-1"
                      onClick={() => handleShare(form)}
                    >
                      <i className="bi bi-share" /> Share
                    </button>
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