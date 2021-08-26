import React from 'react'
import { useSession } from 'next-auth/client'
import { useRouter } from 'next/router'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'

import prisma from '../../lib/db/prisma'
import Header from '../../components/header'
import Footer from '../../components/footer'
import { submitForm } from '../../lib/hooks/use-document-forms'
import { downloadFile } from '../../lib/utils/common'

const Form = withTheme(Bootstrap4Theme)

export interface DocumentProps {
  id: string
  schema: object
  uiSchema: object
}

export default function Document({ schema, uiSchema }: DocumentProps) {
  const router = useRouter()
  // eslint-disable-next-line no-unused-vars
  const [session, loading] = useSession()

  const formId = router.query.string as string

  const handleSubmit = async (data: { formData: FormData }) => {
    const { formData } = data;
    if (formId != null) {
      submitForm(formId, formData)
        .then((res: any) => {
          console.log(res)
          downloadFile(new Blob([res.data]), res.headers['content-disposition'])
        })
        .catch((err: any) => {
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
