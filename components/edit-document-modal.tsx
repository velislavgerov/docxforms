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

/* function transformErrors(errors: any) {
  return errors.map((error: any) => {
    if (error.property === ".name" && error.name === "pattern") {
      // eslint-disable-next-line no-param-reassign
      error.message = "Must be a valid file name that ends with \".docx\". Example: \"document.docx\""
    }
    return error;
  })
} */

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
          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-4">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditDocument