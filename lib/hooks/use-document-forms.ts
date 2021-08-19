import useSWR, { mutate } from 'swr'
import axios from 'axios'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

interface IForm {
  id: string,
  schema: any,
  uiSchema: any,
  createdAt: any,
  updatedAt: any,
}

interface IFormUpdateParams {
  schema: any,
  uiSchema: any,
}

function useDocumentForms (documentId: string) {
  const { data, error } = useSWR(`/api/documents/${documentId}/forms`, fetcher)

  const createForm = () => mutate(`/api/documents/${documentId}/forms`, async (forms: [ IForm ]) => {
    const createdForm = await axios.put(`/api/documents/${documentId}/forms`).then((res) => (res.data))

    const filteredForms = forms.filter((form: IForm) => form.id !== createdForm.id)
    return [...filteredForms, createdForm]
  })

  const updateForm = (formId: string, params: IFormUpdateParams) => mutate(`/api/documents/${documentId}/forms`, async (forms: any) => {
    const updatedForm = await axios.put(`/api/forms/${formId}`, params).then((res) => (res.data))

    const filteredForms = forms.filter((form: IForm) => form.id !== formId)
    return [...filteredForms, updatedForm]
  })

  const deleteForm = (formId: string) => mutate(`/api/documents/${documentId}/forms`, async (forms: [ IForm ]) => {
    await axios.delete(`/api/forms/${formId}`)

    const filteredForms = forms.filter((form: IForm) => form.id !== formId)
    return [...filteredForms]
  })
  
  return {
    forms: data,
    isLoading: !error && !data,
    isError: error,
    updateForm,
    deleteForm,
    createForm,
  }
}

export default useDocumentForms