import React, { FunctionComponent, ReactNode, useState } from 'react'
import Confirm, { ConfirmModalProps } from '../../components/confirm-modal'

export interface ConfirmParams {
  title: ReactNode
  body: ReactNode
  ActionBtn?: FunctionComponent<any>
}

export default function useConfirm() {
  const [confirmModalProps, setConfirmModalProps] = useState<null | ConfirmModalProps>(null)

  const confirm = ({ title, body, ActionBtn } : ConfirmParams) => new Promise((resolve) => {
    setConfirmModalProps({
      body,
      ActionBtn,
      show: true,
      title: title !== null ? title : "Are you absolutely sure?",
      onConfirm: () => {
        setConfirmModalProps({ ...confirmModalProps, show: false })
        return resolve(true)
      },
      onCancel: () => {
        setConfirmModalProps({ ...confirmModalProps, show: false })
        return resolve(false)
      }
    })
  })

  return {
    confirm,
    ConfirmComponent: React.createElement(Confirm, confirmModalProps)
  }
}
