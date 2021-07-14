import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import { DocumentTemplate } from '@prisma/client'
import { useRouter } from 'next/router'

import Link from 'next/link'
import FormBuilder from '../../components/form-builder'

export default function Document () {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [ documentTemplate, setDocumentTemplate ] = useState<null | DocumentTemplate>()

  const { id } = router.query

  const handleUpdate = ({ id, schema, uiSchema }) => {
    axios
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
    <>
      <h1>{documentTemplate?.fileName}</h1>
      <Link href={`/f/${id}`}>
        <a>{`/f/${id}`}</a>
      </Link>
      {documentTemplate?.forms.length && (
        <FormBuilder
          schema={documentTemplate.forms[0].schema}
          uiSchema={documentTemplate.forms[0].uiSchema}
          onUpdate={({ schema, uiSchema }) => handleUpdate({
            id: documentTemplate.id,
            schema,
            uiSchema
          })}
        />
      )}
    </>
  )
}
