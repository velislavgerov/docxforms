import React from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'
import { useRouter } from 'next/router'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'

import prisma from '../../lib/db/prisma'
import Header from '../../components/header'
import Footer from '../../components/footer'

const Form = withTheme(Bootstrap4Theme)

export interface DocumentProps {
  id: string
  schema: object
  uiSchema: object
}

export default function Document({ schema, uiSchema }: DocumentProps) {
  const router = useRouter()
  const [loading] = useSession()

  const { formId } = router.query

  const handleSubmit = async (data: { formData: any }) => {
    const { formData } = data;
    if (formId != null) {
      axios({
        method: 'POST',
        url: `/api/f/${formId}`,
        responseType: 'blob',
        data: formData
      })
        .then((res) => {
          console.log(res)
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
        .catch((err) => {
          console.log(err)
          alert("Failed to get document content")
        })
    }
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  return (
    <div className="container d-flex flex-column min-vh-100">
      <Header />
      <Form
        schema={schema}
        uiSchema={uiSchema}
        onSubmit={handleSubmit}
      />
      <Footer />
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const { params: { formId } } = context

  const form = await prisma.form.findUnique({
    where: {
      id: formId,
    },
    select: {
      id: true,
      schema: true,
      uiSchema: true
    },
  })

  return {
    props: {
      id: form!.id,
      schema: form!.schema,
      uiSchema: form!.uiSchema,
    },
  }
}
