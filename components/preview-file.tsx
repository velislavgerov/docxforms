import React, { MouseEventHandler, useEffect, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'


export interface PreviewFileProps {
  show: boolean
  fileUrl: string
  onCancel: MouseEventHandler
}

function PreviewFile(props: PreviewFileProps) {
  const {
    show,
    fileUrl,
    onCancel,
  } = props

  const [src, setSrc] = useState('')

  useEffect(() => {
    if (show && fileUrl) {
      setSrc(`https://view.officeapps.live.com/op/embed.aspx?src=${'https%3A%2F%2Fdocxforms.herokuapp.com%2Fapi%2Fdocuments%2Fckr4wdpjx00341yy1d45idwij%2Fcontent'}`)
    } else {
      setSrc('')
    }
  }, [show, fileUrl])

  return (
    <Modal fullscreen show={show} onHide={onCancel}>
      <Modal.Body>
        <iframe className="w-100 h-100" title="File Preview" src={src} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PreviewFile