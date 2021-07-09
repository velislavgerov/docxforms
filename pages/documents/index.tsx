import { useState, useEffect, SyntheticEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import { DocumentTemplate } from '@prisma/client'
import { useRouter } from 'next/router'

export default function Documents () {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [ content , setContent ] = useState()
  const [ selectedFile, setSelectedFile ] = useState<null | File>(null);
  const [ documentTemplates, setDocumentTemplates ] = useState<[] | [doc: DocumentTemplate]>([]);

  const fetchDocuments = async () => {
    axios
      .get(`/api/documents`)
      .then((res) => {
        const { content, data } = res.data;
        if (content) { setContent(content) }
        if (data) { setDocumentTemplates(data) }
      })
      .catch((err) => alert("Failed to load document"))
  }

  // Fetch content from protected route
  useEffect(()=>{
    fetchDocuments()
  },[session])

  const handleFileInput = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setSelectedFile(target.files![0])
  }

  const submitForm = (e: FormEvent) => {
    e.preventDefault()

    if (selectedFile == null) {
      alert("Please select file")
      return
    }

    const formData = new FormData()
    formData.append("name", selectedFile.name)
    formData.append("file", selectedFile)
  
    axios
      .post('/api/documents', formData)
      .then((res) => {
        const { id } = res.data.data;
        const form = e.target as HTMLFormElement
        const fileInput = form.querySelector('input[type="file"]')! as HTMLInputElement
        fileInput.value = ''
        if (id) {
          handleEdit(id)
          return
        }
        fetchDocuments()
        alert("File Upload Success")
      })
      .catch((err) => alert("File Upload Error"))
  }

  const handleEdit = (id: string) => {
    router.push(`/documents/${id}`)
  }

  const handleDelete = (id: string) => {
    axios
      .delete(`/api/documents/${id}`)
      .then((res) => {
        fetchDocuments()
        alert("File Deleted Successfully")
      })
      .catch((err) => {
        console.error(err)
        alert("File Delete Error")
      })
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  return (
    <Layout>
      <h1>Protected Page</h1>
      <p><strong>{content || "\u00a0"}</strong></p>
      {documentTemplates != null && 
        (<table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Created at</th>
              <th>Updated at</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
          {documentTemplates.map((doc) => (
            <tr key={doc.id}>
              <td>{doc.fileName}</td>
              <td>{doc.createdAt}</td>
              <td>{doc.updatedAt}</td>
              <td>
                <button onClick={() => handleEdit(doc.id)}>Edit</button>
                <button onClick={() => handleDelete(doc.id)}>Delete</button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>)
      }
      <form onSubmit={submitForm}>
        <input type="file" onChange={handleFileInput} />
        <input type="submit" value="Upload"/>
      </form>
    </Layout>
  )
}