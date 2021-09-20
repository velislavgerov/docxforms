export interface IDocumentTemplate {
  id: string,
  name: string,
  description: string,
  fileUrl: string, 
  createdAt: string,
  updatedAt: string,
  links: {
    [key: string]: {
      href: string,
      rel: string,
      method: string
    }
  }
}

export interface IDocumentTemplateUploadParams {
  name: string,
  file: File,
}

export interface IDocumentTemplateUpdateParams {
  name: string,
  description: string,
}

export interface IForm {
  id: string,
  schema: any,
  uiSchema: any,
  createdAt: any,
  updatedAt: any,
}

export interface IFormUpdateParams {
  schema: any,
  uiSchema: any,
}

export interface ISubmission {
  id: string,
  fileUrl: string,
  formData: object,
  createdAt: string,
}