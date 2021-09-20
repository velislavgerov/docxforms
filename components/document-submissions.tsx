/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { useSession } from 'next-auth/client'
import { toast } from 'react-toastify'

import AccessDenied from './access-denied'
import { useDocumentSubmissions, deleteDocumentSubmission, downloadDocumentSubmission } from '../lib/hooks/use-document-submissions'
import { ISubmission } from '../lib/types/api'
import useConfirm from '../lib/hooks/use-confirm'


function DocumentSubmissions({ documentTemplateId }: { documentTemplateId: string }) {
  const [session, loading] = useSession()
  const { submissions, isLoading, isError } = useDocumentSubmissions(documentTemplateId, session)
  const { confirm, ConfirmComponent } = useConfirm();

  const handleDelete = async (submission: ISubmission) => {
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}>Delete</button>
    const isConfirmed = await confirm({
      title: "Are you sure?",
      body: (<p>This action cannot be undone. This will permanently delete the <strong>{submission.id}</strong> submission.</p>),
      ActionBtn: DeleteBtn,
    })
    if (isConfirmed) {
      console.log(`Delete submission ${submission.id}: confirmed`)

      const deletePromise = deleteDocumentSubmission(documentTemplateId, submission.id)

      deletePromise
        .then(() => {
          console.log(`Delete submission ${submission.id}: confirmed`)
        })
        .catch((err) => {
          console.log(`Delete submission ${submission.id}: failed`, err)
        })

      toast.promise(
        deletePromise,
        {
          pending: {
            render: <span>Deleting <strong>{submission.id}</strong>...</span>,
          },
          success: {
            render: <span>Deleted <strong>{submission.id}</strong></span>,
          },
          error: {
            render: <span>Failed to delete <strong>{submission.id}</strong></span>,
          },
        }
      )
    } else {
      console.log(`Delete submission ${submission.id}: cancelled`)
    }
  }

  const handleDownload = (submission: ISubmission) => {
    const downloadPromise = downloadDocumentSubmission(submission)

    downloadPromise
      .catch((err) => {
        console.log(err)
      })

    toast.promise(
      downloadPromise,
      {
        pending: {
          render: <span>Starting download for <strong>{submission.id}</strong>...</span>,
        },
        success: {
          render: <span>Download started for <strong>{submission.id}</strong></span>,
        },
        error: {
          render: <span>Failed to start download for <strong>{submission.id}</strong></span>,
        },
      }
    )
  }

  const handlePreview = (submission: ISubmission) => {
    const w = window.open(`https://view.officeapps.live.com/op/embed.aspx?src=${submission.fileUrl}`, '_blank');
    if (!w) {
      toast.warn(<span>Could not open preview. Try <a target="_blank" rel="noopener noreferrer" href={`https://view.officeapps.live.com/op/embed.aspx?src=${submission.fileUrl}`}>this link</a> instead</span>)
    }
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  if (submissions == null || isLoading) {
    return (
      <p className="alert alert-light lead">
        Loading document submissions...
      </p>
    )
  }

  if (submissions == null || isError) {
    return (
      <p className="alert alert-danger lead" role="alert">
        Unexpected error occured
      </p>
    )
  }

  if (submissions != null && !submissions.length) {
    return (<>
      <div className="alert alert-warning lead" role="alert">
        No submissions have been made for this document.
      </div>
    </>)
  }

  return (
    <>
      {ConfirmComponent}
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Submitted</th>
              <th scope="col">Submitter</th>
              <th scope="col">Form Data, JSON</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission: any) => (
              <tr key={submission.id}>
                <td>{new Date(submission.createdAt).toLocaleString('en-EU')}</td>
                <td>{submission.user != null ? <a href={`mailto:${submission.user.email}`}>{submission.user.name}</a> : 'N/A'}</td>
                <td>
                  <pre>
                    <code>{JSON.stringify(submission.formData, null, 2)}</code>
                  </pre>
                </td>
                <td>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      className="btn btn-light flex-grow-1"
                      onClick={() => handlePreview(submission)}
                    >
                      <i className="bi bi-eye" /> Preview
                    </button>
                    <button
                      type="button"
                      className="btn btn-warning flex-grow-1"
                      onClick={() => handleDownload(submission)}
                    >
                      <i className="bi bi-download" /> Download
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger flex-grow-1"
                      onClick={() => handleDelete(submission)}
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
    </>
  )
}

export default DocumentSubmissions