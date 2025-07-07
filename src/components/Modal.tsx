import React, { useState } from 'react'
import { Dialog } from '@headlessui/react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null
  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full mx-auto p-6 z-10">
          <Dialog.Title className="text-lg font-bold mb-2 text-gray-900">{title}</Dialog.Title>
          <button onClick={onClose} className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-xl">×</button>
          <div className="mt-2">{children}</div>
        </div>
      </div>
    </Dialog>
  )
}
