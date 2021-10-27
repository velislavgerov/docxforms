import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { Session } from 'next-auth'
import { IDocumentTemplate, IDocumentTemplateUpdateParams, IDocumentTemplateUploadParams } from '../types/api'

const uploadDocumentTemplate = (params: IDocumentTemplateUploadParams) => mutate(`/api/documents`, async (documentTemplates: [ IDocumentTemplate ]) => {
  const { name, file } = params
  const formData = new FormData()
  formData.append("name", name)
  formData.append("file", file)

  const createdDocumentTemplate : IDocumentTemplate = await axios
    .post('/api/documents', formData)
    .then((res) => res.data)
  
  if (documentTemplates != null) {
    const filteredDocumentTemplates = documentTemplates.filter((documentTemplate: IDocumentTemplate) => documentTemplate.id !== createdDocumentTemplate.id)
    return [...filteredDocumentTemplates, createdDocumentTemplate]
  }
})

const updateDocumentTemplate = (documentTemplateId: string, params: IDocumentTemplateUpdateParams) => mutate(`/api/documents`, async (documentTemplates: [ IDocumentTemplate ]) => {
  const updatedDocumentTemplate : IDocumentTemplate = await axios.put(`/api/documents/${documentTemplateId}`, params).then((res) => (res.data))
  mutate(`/api/documents/${documentTemplateId}`)

  if (documentTemplates != null) {
    const filteredDocumentTemplates = documentTemplates.filter((documentTemplate: IDocumentTemplate) => documentTemplate.id !== updatedDocumentTemplate.id)
    return [...filteredDocumentTemplates, updatedDocumentTemplate]
  }
})

const deleteDocumentTemplate = (documentTemplateId: string) => mutate(`/api/documents`, async (documentTemplates: [ IDocumentTemplate ]) => {
  await axios.delete(`/api/documents/${documentTemplateId}`)
  mutate(`/api/documents/${documentTemplateId}`)
  mutate(`/api/documents/${documentTemplateId}/forms`)
  mutate(`/api/documents/${documentTemplateId}/submissions`)

  if (documentTemplates != null) {
    const filteredDocumentTemplates = documentTemplates.filter((documentTemplate: IDocumentTemplate) => documentTemplate.id !== documentTemplateId)
    return [...filteredDocumentTemplates]
  }
})

const downloadDocumentTemplate = (documentTemplateId: string) => axios({
    method: 'GET',
    url: `/api/documents/${documentTemplateId}/file`,
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

interface DocumentTemplates {
  documentTemplates: [] | [IDocumentTemplate] | undefined
  isLoading: boolean
  isError: boolean
}
  
function useDocumentTemplates (session: Session | null): DocumentTemplates {
  const { data, error } = useSWR(session != null ? `/api/documents` : null)

  return {
    documentTemplates: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useDocumentTemplates, uploadDocumentTemplate, updateDocumentTemplate, deleteDocumentTemplate,downloadDocumentTemplate }