import formidable from 'formidable'

export interface FormidableData {
  err: any,
  fields: formidable.Fields;
  files: formidable.Files
}
