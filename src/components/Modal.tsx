import React from 'react'
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
      {/* Kein eigener Kasten mehr, Modal-Inhalt ist jetzt direkt auf dem Hintergrund, mit mehr Breite */}
      <div className="flex items-start justify-center min-h-screen px-0 sm:px-0">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="relative w-full h-full max-w-none max-h-none z-10 flex flex-col items-center justify-start pt-8">
          <div className="w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-1/2 2xl:w-[700px] mx-auto">
            <div className="flex items-center justify-between px-4">
              <Dialog.Title className="text-lg font-bold mb-2 text-white/90">{title}</Dialog.Title>
              <button onClick={onClose} className="text-white/60 hover:text-white text-2xl ml-4">×</button>
            </div>
            <div className="mt-2 px-4 pb-8">{children}</div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
