import React, { useState, MouseEventHandler } from 'react'
import { Button } from 'react-bootstrap'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'

import { toast } from 'react-toastify'
import { IDocumentTemplate } from '../lib/types/api'
import { updateDocumentTemplate } from '../lib/hooks/use-documents'

const Form = withTheme(Bootstrap4Theme)

export interface EditDocumentProps {
  documentTemplate: IDocumentTemplate
}

function EditDocument({ documentTemplate }: EditDocumentProps) {
  const [formData, setFormData] = useState({
    name: documentTemplate.name,
    description: documentTemplate.description
  })

  const handleSave = () => {
    const updatePromise = updateDocumentTemplate(documentTemplate.id, formData)

    updatePromise
      .then(() => {
        console.log(`Saving document ${documentTemplate.name}: success`)
      })
      .catch((err) => {
        console.log(`Saving document ${documentTemplate.name}: failed`, err)
      })

    toast.promise(
      updatePromise,
      {
        pending: {
          render: <span>Saving <strong>{documentTemplate.name}</strong>...</span>,
        },
        success: {
          render: <span>Saved <strong>{documentTemplate.name}</strong></span>,
        },
        error: {
          render: <span>Failed to save <strong>{documentTemplate.name}</strong></span>,
        },
      }
    )
  }

  return (
    <Form
      schema={{
        "type": "object",
        "required": [
          "name",
        ],
        "properties": {
          "name": {
            "type": "string",
            "title": "Name",
          },
          "description": {
            "type": "string",
            "title": "Description"
          }
        }
      }}
      uiSchema={{
        "name": {
          "ui:autofocus": true,
          "ui:emptyValue": ""
        },
        "description": {
          "ui:emptyValue": "",
          "ui:widget": "textarea"
        }
      }}
      onChange={e => setFormData(e.formData)}
      formData={formData}
      onSubmit={handleSave}
      showErrorList={false}
      liveValidate
    >
      <Button type="submit" variant="primary">
        Save
      </Button>
    </Form>
  );
}

export default EditDocument