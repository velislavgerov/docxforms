import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import { DocumentTemplate } from '@prisma/client'
import { useRouter } from 'next/router'

import { JsonForms } from '@jsonforms/react'
import { materialCells, materialRenderers } from '@jsonforms/material-renderers'
import { Button } from '@material-ui/core'

export default function Document () {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [ documentTemplate, setDocumentTemplate ] = useState<null | DocumentTemplate>()
  const [data, setData] = useState()

  const { id } = router.query

  const handleSubmit = async () => {
    if (session != null && id != null && data != null) {
      console.log('data', data)
      axios({
          method: 'POST',
          url: `/api/documents/${id}/content`,
          responseType: 'blob',
          data
        })
        .then((res) => {
          console.log(res)
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');

          let filename = ''
          const disposition = res.headers['content-disposition'];
          // source: https://stackoverflow.com/a/40940790
          if (disposition && disposition.indexOf('attachment') !== -1) {
            var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
            var matches = filenameRegex.exec(disposition)
            if (matches != null && matches[1]) { 
              filename = matches[1].replace(/['"]/g, '')
            }
          }

          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
        })
        .catch((err) => {
          console.log(err)
          alert("Failed to get document content")
        })
    }
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
    <Layout>
      <h1>{documentTemplate?.fileName}</h1>
      {documentTemplate?.forms.length && (<>
        <JsonForms
          schema={documentTemplate.forms[0].schemaJson}
          uischema={documentTemplate.forms[0].formJson}
          data={data}
          renderers={materialRenderers}
          cells={materialCells}
          onChange={({ data, _errors }) => setData(data)}
        />
        <Button fullWidth onClick={handleSubmit} color='primary'>
          Download
        </Button>
      </>)}
    </Layout>
  )
}
