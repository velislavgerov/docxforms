import useSWR from 'swr'
import { Session } from 'next-auth'
import { IDocumentTemplate } from '../types/api'

interface DocumentTemplate {
  documentTemplate: IDocumentTemplate | undefined
  isLoading: boolean
  isError: boolean
}

function useDocumentTemplate (documentTemplateId: string | null, session: Session| null): DocumentTemplate {
  const { data, error } = useSWR(documentTemplateId != null && session != null ? `/api/documents/${documentTemplateId}` : null)

  return {
    documentTemplate: data,
    isLoading: !error && !data,
    isError: error
  }
}

export default useDocumentTemplate