const downloadFile = (fileBlob: Blob, contentDisposition: string) => {
  const url = window.URL.createObjectURL(fileBlob);
  const link = document.createElement('a');

  let filename = ''
  // source: https://stackoverflow.com/a/40940790
  if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
    const matches = filenameRegex.exec(contentDisposition)
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '')
    }
  }

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
}

export { downloadFile }

export default downloadFile