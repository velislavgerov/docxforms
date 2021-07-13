import { createCleanLabel, JsonSchema } from "@jsonforms/core";

import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import InspectModule from 'docxtemplater/js/inspect-module'

import errorHandler from "./error-handler";

interface getSchemaInput {
  buffer: Buffer
  title: string
  description: string 
}

export function getTags (buffer: Buffer) {
  var zip = new PizZip(buffer)
  const iModule = InspectModule()
  let doc
  try {
    doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [iModule]
    })
  } catch(error) {
    // Catch compilation errors (errors caused by the compilation of the template: misplaced tags)
    errorHandler(error)
  }

  return iModule.getAllTags()
}

function transform({ schema, jsonKey, jsonObj, uiSchema, uiControl }: {
  schema: JsonSchema,
  jsonKey: string,
  jsonObj: any,
  uiSchema: object,
  uiControl?: object
}) {
  if( jsonObj !== null && typeof jsonObj == "object" ) {
    if (uiControl) {
      uiSchema.elements.push(uiControl)
    }

    if (jsonKey.startsWith('list_')) {
      jsonObj['type'] = 'array'
      if (Object.keys(jsonObj).length) {
        jsonObj['items'] = {
          type: 'object',
          properties: {},
        }
        Object.entries(jsonObj).forEach(([key, value]) => {
          // key is either an array index or object key
          if (key !== 'type' && key !== 'items') {
            transform({
              uiSchema,
              schema,
              jsonKey: key,
              jsonObj: value
            })
            jsonObj['items']['properties'][key] = value
            delete jsonObj[key]
          }
        })
      }
    } else if (jsonKey.startsWith('if_')) {
      jsonObj['type'] = 'boolean'
      Object.entries(jsonObj).forEach(([key, value]) => {
        // key is either an array index or object key
        if (key !== 'type' && key !== 'items') {
          if (key in schema.properties!) {
            // XXX: What if this placeholder is a Section?
            console.log(`skipping "${key}" because it is already defined`)
          } else {
            transform({
              uiSchema,
              schema,
              jsonKey: key,
              jsonObj: value,
              uiControl: {
                type: 'Control',  
                scope: `#/properties/${key}`,
                label: getLabel(key)
              }
            })
            schema.properties[key] = value
          }
          delete jsonObj[key]
        }
      })
    } else {
      jsonObj['type'] = 'string'
    } 
  }
}

const getLabel = (key: string): string => {
  if (key.startsWith('if_')) {
    key = key.replace('if_', '')
  } else if (key.startsWith('list_')) {
    key = key.replace('list_', '')
  }

  return createCleanLabel(key);
};

export function getSchemas({ buffer, title, description } : getSchemaInput) {
  let schema: JsonSchema = {
    title,
    description,
    type: 'object',
    required: [],
    properties: {},
  };

  let uiSchema = {
    "type": "VerticalLayout",
    "elements": []
  }

  let tags = getTags(buffer)
  if (tags != null) {
    schema.properties = tags

    for (const [key, value] of Object.entries(schema.properties)) {
      console.log(`transform ${key}: ${value}`);
      transform({
        uiSchema,
        schema,
        jsonKey: key,
        jsonObj: value,
        uiControl: {
          type: 'Control',  
          scope: `#/properties/${key}`,
          label: getLabel(key)
        }
      })
    }
  }
  
  return {
    schema,
    uiSchema,
  };
}

const document = { getTags, getSchemas }

export default document