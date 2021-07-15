import React, { useEffect, useState } from 'react';
import { JsonSchema, Layout, UISchemaElement } from '@jsonforms/core';
import { materialCells, materialRenderers } from '@jsonforms/material-renderers';
import { JsonForms } from '@jsonforms/react';
import { Card } from '@material-ui/core';

import { FormBuilder as RJSFFormBuilder } from '@ginkgo-bioworks/react-json-schema-form-builder'

import { withTheme } from '@rjsf/core'
import { Theme as FluentUITheme } from '@rjsf/fluent-ui'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'

const Form = withTheme(Bootstrap4Theme)

export interface FormBuilderProps {
  schema: string,
  uiSchema: string,
  onUpdate: Function,
  onDelete: Function,
  onOpen: Function,
}

export default function FormBuilder(props: FormBuilderProps) {
  const [ data, setData ] = useState();
  const [ state, setState ] = useState({
    schema: '{}',
    uiSchema: '{}',
  })
  
  const handleOpen = () => {
    props.onOpen();
  }
  
  const handleUpdate = () => {
    props.onUpdate({ schema: state.schema, uiSchema: state.uiSchema });
  }
  
  const handleDelete = () => {
    props.onDelete();
  }

  useEffect(() => {
    setState({
      schema: JSON.stringify(props.schema),
      uiSchema: JSON.stringify(props.uiSchema),
    })
  }, [])

  return (
    <>
      <div className="row mt-2">
        <div className="col-8 btn-group">
          <button type="button" className="btn btn-light" onClick={handleOpen}>Open</button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleUpdate}
          >
            {'Save'}
          </button>
          <button type="button" className="btn btn-dark" onClick={handleDelete}>Delete</button>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-8">
          <h5>Form Builder</h5>
          <RJSFFormBuilder
            schema={state.schema}
            uischema={state.uiSchema}
            onChange={(newSchema: string, newUiSchema: string) => {
              setState({
                schema: newSchema,
                uiSchema: newUiSchema
              })
            }}
          />
        </div>
        <div className="col">
          <h5>Live Preview</h5>
          <div className="card sticky-top">
            <div className="card-body">
              <Form
                schema={JSON.parse(state.schema)}
                uiSchema={JSON.parse(state.uiSchema)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
