import useSWR from 'swr'
import { Session } from 'next-auth'
import { IDocumentTemplate } from '../types/api'

function useDocumentTemplate (documentTemplateId: string | null, session: Session| null) {
  const { data, error } = useSWR(documentTemplateId != null && session != null ? `/api/documents/${documentTemplateId}` : null)

  return {
    documentTemplate: <null | IDocumentTemplate>data,
    isLoading: !error && !data,
    isError: error
  }
}

export default useDocumentTemplate