import { useState, useEffect, SyntheticEvent, FormEvent } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'

import Layout from '../../components/layout'
import AccessDenied from '../../components/access-denied'
import { DocumentTemplate } from '@prisma/client'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '../../components/header'

export default function Documents () {
  const router = useRouter()
  const [ session, loading ] = useSession()
  const [ content , setContent ] = useState()
  const [ documentTemplates, setDocumentTemplates ] = useState<[] | [doc: DocumentTemplate]>([]);

  const fetchDocuments = async () => {
    if (session) {
      axios
        .get(`/api/documents`)
        .then((res) => {
          const { content, data } = res.data;
          if (content) { setContent(content) }
          if (data) { setDocumentTemplates(data) }
        })
        .catch((err) => alert("Failed to load document"))
    }
  }

  // Fetch content from protected route
  useEffect(()=>{
    fetchDocuments()
  },[session])

  const handleFileInput = (e: SyntheticEvent) => {
    e.preventDefault()

    const target = e.target as HTMLInputElement
    const selectedFile = target.files![0]
    const formData = new FormData()
    formData.append("name", selectedFile.name)
    formData.append("file", selectedFile)
  
    axios
      .post('/api/documents', formData)
      .then((res) => {
        const { id } = res.data.data
        handleEdit(id)
      })
      .catch((err) => {
        console.log(err)
        alert("File Upload Error")
      })
  }

  const handleDownload = (id: string) => {
    axios({
        method: 'GET',
        url: `/api/documents/${id}/content`,
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

  const handleView = (id: string) => {
    router.push(`/f/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/documents/${id}`)
  }

  const handleDelete = (id: string) => {
    axios
      .delete(`/api/documents/${id}`)
      .then((res) => {
        fetchDocuments()
        alert("File Deleted Successfully")
      })
      .catch((err) => {
        console.error(err)
        alert("File Delete Error")
      })
  }

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null

  // If no session exists, display access denied message
  if (!session) { return  <Layout><AccessDenied/></Layout> }

  // If session exists, display content
  return (
    <div className="container">
      <Header/>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/"><a>Home</a></Link></li>
          <li className="breadcrumb-item active" aria-current="page">Documents</li>
        </ol>
      </nav>
      <div className="pb-2">
        <h1 className="display-5">
          {'Documents'}
        </h1>
        {content && <> 
          <label htmlFor="docxFile" className="form-label">Upload your .docx template to get a web form.</label>
          <input className="form-control" type="file" id="docxFile" onChange={handleFileInput} accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"/>
        </>}
      </div>
      {(documentTemplates != null && documentTemplates.length) ? 
        (<div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Created at</th>
                <th scope="col">Updated at</th>
                <th scope="col" colSpan={3}>Actions</th>
              </tr>
            </thead>
            <tbody>
            {documentTemplates.map((doc) => (
              <tr key={doc.id}>
                <td scope="row">
                  <Link href={`/documents/${doc.id}`}>
                    <a>{doc.fileName}</a>
                  </Link>
                </td>
                <td>{doc.createdAt}</td>
                <td>{doc.updatedAt}</td>
                <td>
                  <button type="button" className="btn btn-light w-100" onClick={() => handleView(doc.id)}>Open</button>
                </td>
                <td>
                  <button type="button" className="btn btn-warning w-100" onClick={() => handleEdit(doc.id)}>Edit</button>
                </td>
                <td>
                  <button type="button" className="btn btn-warning w-100" onClick={() => handleDownload(doc.id)}>Download</button>
                </td>
                <td>
                  <button type="button" className="btn btn-dark w-100" onClick={() => handleDelete(doc.id)}>Delete</button>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      ) : ( 
        <div className="alert alert-light" role="alert">
          No files uploaded. To get started please select a .docx!
        </div>
      )}
    </div>
  )
}