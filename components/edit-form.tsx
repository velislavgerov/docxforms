import React, { useState, MouseEventHandler } from 'react'
import { Button, Modal } from 'react-bootstrap'

const { FormBuilder: RJSFFormBuilder } = require('@ginkgo-bioworks/react-json-schema-form-builder')

export interface EditFormProps {
  show: boolean
  form: any
  onCancel: MouseEventHandler
  onSave: any
}

function EditForm(props: EditFormProps) {
  const {
    show,
    form,
    onCancel,
    onSave,
  } = props


  const [state, setState] = useState({
    schema: JSON.stringify(form.schema),
    uiSchema: JSON.stringify(form.uiSchema),
  })

  const handleSave = () => onSave({ formId: form.id, schema: JSON.parse(state.schema), uiSchema: JSON.parse(state.uiSchema) })

  return (
    <Modal show={show} onHide={onCancel}>
      <Modal.Header>
        <Modal.Title>Edit <strong>{form.schema.title}</strong></Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <RJSFFormBuilder
          schema={state.schema}
          uischema={state.uiSchema}
          onChange={(newSchema: string, newUiSchema: string) => {
            setState({
              schema: newSchema,
              uiSchema: newUiSchema
            })
          }}
          mods={{
            showFormHead: true,
          }}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" onClick={handleSave}>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EditForm