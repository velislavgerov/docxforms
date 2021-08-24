import React, { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/client'
import { Button } from 'react-bootstrap'

import Layout from './layout'
import AccessDenied from './access-denied'
import Confirm, { ConfirmProps } from './confirm'
import { useDocumentSubmissions, deleteDocumentSubmission } from '../lib/hooks/use-document-submissions'
import { ISubmission } from '../lib/types/api'

function DocumentSubmissions({ documentTemplateId }: { documentTemplateId: string }) {
  const [session, loading] = useSession()
  const { submissions, isLoading, isError } = useDocumentSubmissions(documentTemplateId, session)

  const [confirm, setConfirm] = useState<null | ConfirmProps>(null);

  const handleDelete = (submission: ISubmission) => {
    const deleteBtn = <Button
      variant="dark"
      onClick={() =>
        deleteDocumentSubmission(documentTemplateId, submission.id)
          .then(() => setConfirm(null))
      }
    >
      Delete
    </Button>

    setConfirm({
      show: true,
      title: 'Confirmation Required',
      body: 'This action is irreversible. Are you sure you want to delete this submission?',
      actionBtn: deleteBtn,
      onCancel: () => setConfirm(null),
    })
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <Layout><AccessDenied /></Layout> }

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
      <h2>Manage Submissions</h2>
      <p className="lead">This is a lead paragraph with some useful information about submissions.</p>
      <div className="alert alert-light" role="alert">
        No submissions have been made for this document template.
      </div>
    </>)
  }

  return (
    <>
      {confirm && <Confirm {...confirm} />}
      <h2>Manage Submissions</h2>
      <p className="lead">This is a lead paragraph with some useful information about submissions.</p>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Submitted at</th>
              <th scope="col">Submitted by, Name</th>
              <th scope="col">Submitted by, Email</th>
              <th scope="col">Form Data, JSON</th>
              <th scope="col">File</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission: any) => (
              <tr key={submission.id}>
                <td>{submission.createdAt}</td>
                <td>{submission.user != null ? submission.user.name : 'N/A'}</td>
                <td>{submission.user != null ? <a href={`mailto:${submission.user.email}`}>{submission.user.email}</a> : 'N/A'}</td>
                <td>
                  <pre>
                    <code>{JSON.stringify(submission.formData, null, 2)}</code>
                  </pre>
                </td>
                <td>
                  <Link href={`${submission.fileUrl}`}>
                    <a target="_blank" rel="noopener noreferrer">Download</a>
                  </Link>
                </td>
                <td>
                  <div className="d-grid gap-2 d-sm-flex">
                    <button
                      type="button"
                      className="btn btn-dark flex-grow-1"
                      onClick={() => handleDelete(submission)}
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

export default DocumentSubmissions