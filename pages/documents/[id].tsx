import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession } from 'next-auth/client'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'

import FormBuilder from '../../components/form-builder'
import Header from '../../components/header'

export default function Document() {
  const router = useRouter()
  const [session, loading] = useSession()
  const [documentTemplate, setDocumentTemplate] = useState<null | any>()

  const { id } = router.query

  const handleView = (targetId: string) => {
    router.push(`/f/${targetId}`)
  }

  const handleDelete = (targetId: string) => axios
    .delete(`/api/documents/${targetId}`)
    .then(() => {
      router.push(`/documents`)
      alert("File Deleted Successfully")
    })
    .catch((err) => {
      console.error(err)
      alert("File Delete Error")
    })

  const handleUpdate = ({ targetId, schema, uiSchema }: { targetId: string, schema: object, uiSchema: object }) => axios
    .patch(`/api/documents/${targetId}`, { schema, uiSchema })
    .then(() => {
      alert("Document Update Success")
    })
    .catch((err) => {
      console.error(err)
      alert("Document Update Error")
    })


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
        .catch((err) => {
          console.log(err)
          alert("Failed to load document")
        })
    }
  }, [session, id])

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return <Layout><AccessDenied /></Layout> }

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
            targetId: documentTemplate.id,
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
