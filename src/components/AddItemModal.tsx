'use client'

import { Fragment } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, Transition } from '@headlessui/react'
import { X, ScanLine, PlusCircle, Zap } from 'lucide-react'

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
}

const AddItemModal = ({ isOpen, onClose }: AddItemModalProps) => {
  const router = useRouter()

  const handleActionClick = (path: string) => {
    onClose()
    router.push(path)
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-full"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-t-3xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-bold leading-6 text-gray-900 flex justify-between items-center"
                >
                  Schnell hinzufügen
                  <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="h-5 w-5 text-gray-600" />
                  </button>
                </Dialog.Title>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => handleActionClick('/scanner')}
                    className="flex flex-col items-center justify-center p-4 bg-emerald-50 hover:bg-emerald-100 rounded-2xl text-emerald-700 transition-colors"
                  >
                    <ScanLine className="h-8 w-8 mb-2" />
                    <span className="font-semibold text-sm">Scannen</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('/diary/add')}
                    className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl text-blue-700 transition-colors"
                  >
                    <PlusCircle className="h-8 w-8 mb-2" />
                    <span className="font-semibold text-sm">Mahlzeit</span>
                  </button>
                  <button
                    onClick={() => handleActionClick('/scanner?mode=device-scan')}
                    className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl text-purple-700 transition-colors"
                  >
                    <Zap className="h-8 w-8 mb-2" />
                    <span className="font-semibold text-sm">Gerät scannen</span>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default AddItemModal
