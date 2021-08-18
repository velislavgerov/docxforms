import React, { ReactNode, MouseEventHandler } from 'react'
import { Button, Modal } from 'react-bootstrap'

export interface ConfirmProps {
  title: ReactNode
  body: ReactNode
  actionBtn: ReactNode
  show: boolean
  onCancel: MouseEventHandler
}

function Confirm(props: ConfirmProps) {
  const {
    title,
    body,
    actionBtn,
    show,
    onCancel,
  } = props

  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{body}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        {actionBtn}
      </Modal.Footer>
    </Modal>
  );
}

export default Confirm