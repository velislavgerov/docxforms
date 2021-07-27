import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import { useRouter } from 'next/router'

import Link from 'next/link'
import FormBuilder from '../../components/form-builder'
import Header from '../../components/header'

export default function Document () {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [ documentTemplate, setDocumentTemplate ] = useState<null | any>()

  const { id } = router.query

  const handleView = (id: string) => {
    router.push(`/f/${id}`)
  }

  const handleDelete = (id: string) => {
    return axios
      .delete(`/api/documents/${id}`)
      .then((res) => {
        router.push(`/documents`)
        alert("File Deleted Successfully")
      })
      .catch((err) => {
        console.error(err)
        alert("File Delete Error")
      })
  }

  const handleUpdate = ({ id, schema, uiSchema } : { id: string, schema: object, uiSchema: object}) => {
    return axios
      .patch(`/api/documents/${id}`, { schema, uiSchema })
      .then((res) => {
        alert("Document Update Success")
      })
      .catch((err) => alert("Document Update Error"))
  }


  // Fetch content from protected route
  useEffect(() => {
    if (session != null && id != null) {
      axios
        .get(`/api/documents/${id}`)
        .then((res) => {
          const { data } = res.data;
          if (data) {
            setDocumentTemplate(data)
          }
        })
        .catch((err) => alert("Failed to load document"))
    }
  }, [session, id])

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  return (
    <div className="container">
      <Header />
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/"><a>Home</a></Link></li>
          <li className="breadcrumb-item active"><Link href="/documents"><a>Documents</a></Link></li>
          <li className="breadcrumb-item active" aria-current="page">
            {!documentTemplate && 'Loading...'}
            {documentTemplate && documentTemplate.fileName}
          </li>
        </ol>
      </nav>
      <h1 className="display-5">
        {documentTemplate && documentTemplate.fileName}
      </h1>
      {documentTemplate && (<>
        <FormBuilder
          formId={documentTemplate.id}
          schema={documentTemplate.forms[0].schema}
          uiSchema={documentTemplate.forms[0].uiSchema}
          onUpdate={({ schema, uiSchema }: { schema: object, uiSchema: object }) => handleUpdate({
            id: documentTemplate.id,
            schema,
            uiSchema
          })}
          onOpen={() => handleView(documentTemplate.id)}
          onDelete={() => handleDelete(documentTemplate.id)}
        />
      </>)}
    </div>
  )
}
