import React, { ReactNode, MouseEventHandler, FunctionComponent } from 'react'
import { Button, Modal } from 'react-bootstrap'

export interface ConfirmModalProps {
  show: boolean
  title?: ReactNode
  body?: ReactNode
  ActionBtn?: FunctionComponent<any>
  onCancel?: MouseEventHandler
  onConfirm?: MouseEventHandler
}

function ConfirmModal({
  show,
  title,
  body,
  ActionBtn,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
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
        {ActionBtn != null && <ActionBtn onClick={onConfirm} />}
        {ActionBtn == null && <Button variant="primary" onClick={onConfirm}>Confirm</Button>}
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmModal