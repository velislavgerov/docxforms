import axios from 'axios'
import { Session } from 'next-auth'
import useSWR, { mutate } from 'swr'
import { ISubmission } from '../types/api'

const deleteDocumentSubmission = (documentTemplateId: string, submissionId: string) => mutate(`/api/documents/${documentTemplateId}/submissions`, async (submissions: [ISubmission]) => {
  await axios.delete(`/api/submissions/${submissionId}`)

  const filteredSubmissions = submissions.filter((submission: ISubmission) => submission.id !== submissionId)
  return [...filteredSubmissions]
})

function useDocumentSubmissions (documentTemplateId: null | string, session: null | Session ) {
  const { data, error } = useSWR(documentTemplateId != null && session != null ? `/api/documents/${documentTemplateId}/submissions` : null)

  return {
    submissions: <null | [] | [ISubmission]>data,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useDocumentSubmissions, deleteDocumentSubmission }