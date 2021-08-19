import useSWR from 'swr'
import axios from 'axios'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

function useDocumentTemplate (documentTemplateId: string) {
  const { data, error } = useSWR(`/api/documents/${documentTemplateId}`, fetcher)

  return {
    documentTemplate: data,
    isLoading: !error && !data,
    isError: error
  }
}

export default useDocumentTemplate