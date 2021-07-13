import { JsonSchema } from "@jsonforms/core";

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

function traverse(topObj: object, jsonKey: string, jsonObj: any) {
  if( jsonObj !== null && typeof jsonObj == "object" ) {
    if (Object.keys(jsonObj).length && jsonKey.startsWith('list_')) {
      jsonObj['type'] = 'array'
      jsonObj['items'] = {
        type: 'object',
        properties: {},
      }
      Object.entries(jsonObj).forEach(([key, value]) => {
        // key is either an array index or object key
        if (key !== 'type' && key !== 'items') {
          traverse(topObj, key, value)
          jsonObj['items']['properties'][key] = value
          delete jsonObj[key]
        }
      });
    } else if (Object.keys(jsonObj).length && jsonKey.startsWith('if_')) {
      jsonObj['type'] = 'boolean'
      Object.entries(jsonObj).forEach(([key, value]) => {
        // key is either an array index or object key
        if (key !== 'type' && key !== 'items') {
          traverse(topObj, key, value)
          if (key in topObj) {
            // XXX: What if this placeholder is a Section?
            console.log(`skipping "${key}" because it is already defined`)
          } else {
            topObj[key] = value
          }
          delete jsonObj[key]
        }
      })
    } else if (jsonKey.startsWith('if_')) {
      jsonObj['type'] = 'boolean'
    } else {
      jsonObj['type'] = 'string'
    } 
  }
}

export function getSchema({ buffer, title, description } : getSchemaInput) {
  let schema: JsonSchema = {
    title,
    description,
    type: 'object',
    required: [],
    properties: {},
  };

  let tags = getTags(buffer)

  if (tags != null) {
    for (const [key, value] of Object.entries(tags)) {
      console.log(`${key}: ${value}`);
      traverse(tags, key, value)
    }
    schema.properties = tags
    /*for (const [key, value] of Object.entries(tags)) {
      console.log(`${key}: ${value}`);
      if (key in schema.properties!) {
        console.log(`skipping "${key}" because it is already defined`)
      } else {
        schema.required!.push(key)
        schema.properties![key] = {
          type: 'string',
        };
      }
    }*/
  }
  
  return schema;
}

const document = { getTags, getSchema }

export default document