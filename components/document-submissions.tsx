/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/client'

import AccessDenied from './access-denied'
import { useDocumentSubmissions, deleteDocumentSubmission } from '../lib/hooks/use-document-submissions'
import { ISubmission } from '../lib/types/api'
import useConfirm from '../lib/hooks/use-confirm'

function DocumentSubmissions({ documentTemplateId }: { documentTemplateId: string }) {
  const [session, loading] = useSession()
  const { submissions, isLoading, isError } = useDocumentSubmissions(documentTemplateId, session)

  const { confirm, ConfirmComponent } = useConfirm();

  const handleDelete = async (submission: ISubmission) => {
    const DeleteBtn = (props: any) => <button type="button" className="btn btn-danger" {...props}><i className="bi bi-trash" /> Delete</button>
    const isConfirmed = await confirm({
      title: "Are you sure?",
      body: (<p>This action cannot be undone. This will permanently delete the <strong>{submission.id}</strong> submission.</p>),
      ActionBtn: DeleteBtn,
    })
    if (isConfirmed) {
      console.log(`Delete submission ${submission.id}: confirmed`)
      deleteDocumentSubmission(documentTemplateId, submission.id)
        .then(() => console.log(`Delete submission ${submission.id}: success`))
        .catch((err) => {
          console.log(`Delete submission ${submission.id}: failed`, err)
          alert(`Delete submission ${submission.id}: failed`)
        })
    } else {
      console.log(`Delete submission ${submission.id}: cancelled`)
    }
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <AccessDenied /> }

  if (submissions == null || isLoading) {
    return (
      <p className="lead mb-4">
        Loading document submissions...
      </p>
    )
  }

  if (submissions == null || isError) {
    return (
      <p className="lead mb-4">
        Unexpected error occured
      </p>
    )
  }

  if (submissions != null && !submissions.length) {
    return (<>
      <div className="alert alert-light" role="alert">
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
                    <Link
                      passHref
                      href={`https://view.officeapps.live.com/op/embed.aspx?src=${submission.fileUrl}`}
                    >
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        type="button"
                        className="btn btn-light flex-grow-1"
                      >
                        <i className="bi bi-eye" /> Preview
                      </a>
                    </Link>
                    <Link href={`${submission.fileUrl}`}>
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        type="button"
                        className="btn btn-warning flex-grow-1"
                      >
                        <i className="bi bi-download" /> Download
                      </a>
                    </Link>
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