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
}

export default function FormBuilder(props: FormBuilderProps) {
  const [ data, setData ] = useState();
  const [ state, setState ] = useState({
    schema: '{}',
    uiSchema: '{}',
  })

  const handleUpdate = () => {
    props.onUpdate({ schema: state.schema, uiSchema: state.uiSchema });
  }

  useEffect(() => {
    setState({
      schema: JSON.stringify(props.schema),
      uiSchema: JSON.stringify(props.uiSchema),
    })
  }, [])

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <Form
            schema={JSON.parse(state.schema)}
            uiSchema={JSON.parse(state.uiSchema)}
          />
        </div>
        <div className="col">
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleUpdate}
          >
            {'Update'}
          </button>
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
      </div>
    </div>
  )
}