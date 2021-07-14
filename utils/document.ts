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

function transform({ schema, jsonKey, jsonObj, uiSchema, addToUiOrder }: {
  schema: JsonSchema,
  jsonKey: string,
  jsonObj: any,
  uiSchema: object,
  addToUiOrder?: boolean
}) {
  if( jsonObj !== null && typeof jsonObj == "object" ) {
    jsonObj['title'] = getLabel(jsonKey)

    if (addToUiOrder && !uiSchema['ui:order'].some((key: string) => key === jsonKey)) {
      uiSchema['ui:order'].push(jsonKey)
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
          if (key !== 'type' && key !== 'items' && key !== 'title') {
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
        if (key !== 'type' && key !== 'items' && key !== 'title') {
          // XXX: Making assumptions that this will work with variable depth. Test it!
          schema.dependencies[jsonKey] = {
            oneOf: [
              {
                required: [],
                properties: {
                  [key]: value,
                  [jsonKey]: {
                    enum: [
                      true
                    ]
                  }
                }
              }
            ]
          }
          transform({
            uiSchema,
            schema,
            jsonKey: key,
            jsonObj: schema.dependencies[jsonKey].oneOf[0].properties[key],
            addToUiOrder: true,
          })
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
    dependencies: {}
  }

  let uiSchema = {
    'ui:order': []
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
        addToUiOrder: true,
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