import { useState, useEffect, SyntheticEvent } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../components/layout'
import AccessDenied from '../components/access-denied'
import { DocumentTemplate } from '@prisma/client'

export default function Documents () {
  const [ session, loading ] = useSession()
  const [ content , setContent ] = useState()
  const [ selectedFile, setSelectedFile ] = useState<null | File>(null);
  const [ documentTemplates, setDocumentTemplates ] = useState();

  // Fetch content from protected route
  useEffect(()=>{
    const fetchData = async () => {
      const res = await fetch('/api/documents')
      const json = await res.json()
      if (json.content) { setContent(json.content) }
      if (json.documentTemplates) { setDocumentTemplates(json.documentTemplates) }
    }
    fetchData()
  },[session])

  const handleFileInput = (e: SyntheticEvent) => {
    const target = e.target as HTMLInputElement
    setSelectedFile(target.files![0])
  }

  const submitForm = () => {
    const formData = new FormData()
    formData.append("name", selectedFile!.name)
    formData.append("file", selectedFile!)
  
    axios
      .post('/api/documents', formData)
      .then((res) => {
        alert("File Upload success")
      })
      .catch((err) => alert("File Upload Error"))
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
        (<ul>
          {documentTemplates.map((doc: DocumentTemplate) => <li key={doc.id}>{doc.fileName}</li>)}
        </ul>)
      }
      <form>
        <input type="file" onChange={handleFileInput} />
        <input type="submit" onClick={submitForm} />
      </form>
    </Layout>
  )
}