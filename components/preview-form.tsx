import React, { MouseEventHandler, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'
import axios from 'axios'

const Form = withTheme(Bootstrap4Theme)

export interface PreviewFormProps {
  show: boolean
  form: any
  onCancel: MouseEventHandler
}

function PreviewForm(props: PreviewFormProps) {
  const {
    show,
    form,
    onCancel,
  } = props

  const [formData, setFormData] = useState();

  const handleSubmit = async () => {
    if (form.id != null) {
      axios({
        method: 'POST',
        url: `/api/f/${form.id}`,
        responseType: 'blob',
        data: formData
      })
        .then((res) => {
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
          {true}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Submit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PreviewForm