import useSWR from 'swr'
import { ISubmission } from '../types/api'

function useDocumentSubmissions (documentTemplateId: string) {
  const { data, error } = useSWR(`/api/documents/${documentTemplateId}/submissions`)

  return {
    submissions: <null | [] | [ ISubmission ]>data,
    isLoading: !error && !data,
    isError: error,
  }
}

export default useDocumentSubmissions