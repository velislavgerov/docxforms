import useSWR, { mutate } from 'swr'
import axios from 'axios'
import { Session } from 'next-auth'

import { IForm, IFormUpdateParams } from '../types/api'

const createDocumentForm = (documentTemplateId: string) => mutate(`/api/documents/${documentTemplateId}/forms`, async (forms: [ IForm ]) => {
  const createdForm = await axios.put(`/api/documents/${documentTemplateId}/forms`).then((res) => (res.data))

  const filteredForms = forms.filter((form: IForm) => form.id !== createdForm.id)
  return [...filteredForms, createdForm]
})

const updateDocumentForm = (documentTemplateId: string, formId: string, params: IFormUpdateParams) => mutate(`/api/documents/${documentTemplateId}/forms`, async (forms: any) => {
  const updatedForm = await axios.put(`/api/forms/${formId}`, params).then((res) => (res.data))

  const filteredForms = forms.filter((form: IForm) => form.id !== formId)
  return [...filteredForms, updatedForm]
})

const deleteDocumentForm = (documentTemplateId: string, formId: string) => mutate(`/api/documents/${documentTemplateId}/forms`, async (forms: [ IForm ]) => {
  await axios.delete(`/api/forms/${formId}`)
  mutate(`/api/documents/${documentTemplateId}/submissions`)

  const filteredForms = forms.filter((form: IForm) => form.id !== formId)
  return [...filteredForms]
})

const submitForm = (formId: string, formData: FormData | undefined) => axios({
  method: 'POST',
  url: `/api/f/${formId}`,
  responseType: 'blob',
  data: formData
})

const submitDocumentForm = async (documentTemplateId: string, formId: string, formData: FormData | undefined) => {
  const res = await axios({
    method: 'POST',
    url: `/api/f/${formId}`,
    responseType: 'blob',
    data: formData
  })

  mutate(`/api/documents/${documentTemplateId}/submissions`)

  return res
}

function useDocumentForms (documentTemplateId: string | null, session: Session | null) {
  const { data, error } = useSWR(documentTemplateId != null && session != null ? `/api/documents/${documentTemplateId}/forms` : null)

  return {
    forms: <null | [] | [IForm]>data,
    isLoading: !error && !data,
    isError: error,
  }
}

export { useDocumentForms, createDocumentForm, updateDocumentForm, deleteDocumentForm, submitForm, submitDocumentForm }