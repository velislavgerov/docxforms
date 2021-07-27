import React, { useEffect, useState } from 'react';

import { withTheme } from '@rjsf/core'
import { Theme as Bootstrap4Theme } from '@rjsf/bootstrap-4'
import axios from 'axios';

const Form = withTheme(Bootstrap4Theme)

const { FormBuilder: RJSFFormBuilder } = require('@ginkgo-bioworks/react-json-schema-form-builder')

export interface FormBuilderProps {
  formId: string,
  schema: string,
  uiSchema: string,
  onUpdate: Function,
  onDelete: Function,
  onOpen: Function,
}

export default function FormBuilder(props: FormBuilderProps) {
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

  const handleDownload = () => {
    return axios({
        method: 'GET',
        url: `/api/documents/${props.formId}/content`,
        responseType: 'blob',
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

  const handleSubmit = async (data: { formData: any; }) => {
    const { formData } = data
    return axios({
        method: 'POST',
        url: `/api/f/${props.formId}`,
        responseType: 'blob',
        data: formData
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

  useEffect(() => {
    setState({
      schema: JSON.stringify(props.schema),
      uiSchema: JSON.stringify(props.uiSchema),
    })
  }, [])

  return (
    <>
      <div className="row mt-2">
        <div className="col-md-8">
          <div className="d-grid gap-2 d-sm-flex">
            <button
              type="button"
              className="btn btn-primary flex-grow-1"
              onClick={handleUpdate}
            >
              {'Save'}
            </button>
            <button type="button" className="btn btn-light flex-grow-1" onClick={handleOpen}>Open</button>
            <button type="button" className="btn btn-warning flex-grow-1">Edit</button>
            <button type="button" className="btn btn-warning flex-grow-1" onClick={handleDownload}>Download</button>
            <button type="button" className="btn btn-dark flex-grow-1" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-md-8">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#form-builder">Form Builder</a>
            </li>
          </ul>
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
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#live-preview">Live Preview</a>
            </li>
          </ul>
          <div className="sticky-top">
            <div className="card-body">
              <Form
                schema={JSON.parse(state.schema)}
                uiSchema={JSON.parse(state.uiSchema)}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
