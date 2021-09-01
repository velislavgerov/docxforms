import React, { MouseEventHandler, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'
import { submitDocumentForm, submitForm } from '../lib/hooks/use-document-forms'
import { downloadFile } from '../lib/utils/common'

const Form = withTheme(Bootstrap4Theme)

export interface PreviewFormProps {
  show: boolean
  form: any
  documentTemplateId: string | undefined
  onCancel: MouseEventHandler
}

function PreviewDocumentForm(props: PreviewFormProps) {
  const {
    show,
    form,
    documentTemplateId,
    onCancel,
  } = props

  const [formData, setFormData] = useState();

  const handleSubmit = async () => {
    if (form.id != null) {
      const promise = (documentTemplateId != null) ? submitDocumentForm(documentTemplateId, form.id, formData) : submitForm(form.id, formData)
      promise
        .then((res) => {
          const file = new Blob([res.data])
          const disposition = res.headers['content-disposition']
          downloadFile(file, disposition)
        })
        .catch((err) => {
          console.log(err)
          alert("Failed to get document content")
        })
    }
  }

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Body>
        <Form
          schema={form.schema}
          uiSchema={form.uiSchema}
          onChange={e => setFormData(e.formData)}
          formData={formData}
          onSubmit={handleSubmit}
        >
          <div className="d-flex gap-2 justify-content-end border-top pt-3 mt-4">
            <Button variant="secondary" onClick={onCancel}>
              Close
            </Button>
            <Button type="submit" variant="primary">
              Submit
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default PreviewDocumentForm