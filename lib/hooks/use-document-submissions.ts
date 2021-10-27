import axios from 'axios'
import { Session } from 'next-auth'
import useSWR, { mutate } from 'swr'
import { ISubmission } from '../types/api'

const deleteDocumentSubmission = (documentTemplateId: string, submissionId: string) => mutate(`/api/documents/${documentTemplateId}/submissions`, async (submissions: [ISubmission]) => {
  await axios.delete(`/api/submissions/${submissionId}`)

  const filteredSubmissions = submissions.filter((submission: ISubmission) => submission.id !== submissionId)
  return [...filteredSubmissions]
})

const downloadDocumentSubmission = (submission: ISubmission) => axios({
    method: 'GET',
    url: submission.fileUrl,
    responseType: 'blob',
  })
  .then((res) => {
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

interface DocumentSubmissions {
  submissions: [] | [ISubmission] | undefined
  isLoading: boolean
  isError: boolean
}

function useDocumentSubmissions (documentTemplateId: null | string, session: null | Session ): DocumentSubmissions {
  const { data, error } = useSWR(documentTemplateId != null && session != null ? `/api/documents/${documentTemplateId}/submissions` : null)

  return {
    submissions: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useDocumentSubmissions, deleteDocumentSubmission, downloadDocumentSubmission }