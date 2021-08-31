import React, { useState, MouseEventHandler } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'

import { IDocumentTemplate } from '../lib/types/api'

const Form = withTheme(Bootstrap4Theme)

export interface EditDocumentProps {
  show: boolean
  documentTemplate: IDocumentTemplate
  onCancel: MouseEventHandler
  onSave: any
}

function EditDocument({ show, documentTemplate, onCancel, onSave }: EditDocumentProps) {
  const [formData, setFormData] = useState({
    name: documentTemplate.name,
    description: documentTemplate.description
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Body>
        <Form
          schema={{
            "type": "object",
            "required": [
              "name",
            ],
            "properties": {
              "name": {
                "type": "string",
                "title": "Name"
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
          onSubmit={onSave}
          liveValidate
        >
          {true}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditDocument