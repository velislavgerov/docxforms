import { useState } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import prisma from '../../lib/prisma'

import { useRouter } from 'next/router'
import { withTheme } from '@rjsf/core';
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'
import { Context } from 'docx-templates/lib/types'
import { GetServerSidePropsContext } from 'next'

const Form = withTheme(Bootstrap4Theme)

export interface DocumentProps {
  id: string
  schema: object
  uiSchema: object 
}

export default function Document (props: DocumentProps) {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [data, setData] = useState()

  const { formId } = router.query

  const handleSubmit = async () => {
    if (formId != null && data != null) {
      console.log('data', data)
      axios({
          method: 'POST',
          url: `/api/f/${formId}`,
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

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  return (
    <div className="container">
      <Form
        schema={props.schema}
        uiSchema={props.uiSchema}
        formData={data}
        onChange={e => setData(e.formData)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export async function getServerSideProps(context: any) {
  const { params: { formId } } = context

  const documentTemplate = await prisma.documentTemplate.findUnique({
    where: {
      id: formId,
    },
    select: {
      id: true,
      forms: true,
    },
  })

  return {
    props: {
      id: documentTemplate!.id,
      schema: documentTemplate!.forms[0].schema,
      uiSchema: documentTemplate!.forms[0].uiSchema,
    },
  }
}
