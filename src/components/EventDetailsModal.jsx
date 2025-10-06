import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { formatInTimeZone } from '@/lib/helpers';

const EventDetailsModal = ({ isOpen, onClose, event, timezone }) => {
  if (!event) return null;

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
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-full p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-800">
                <Dialog.Title className="pb-2 text-xl font-bold border-b dark:border-gray-600 dark:text-white">
                  {event.title}
                </Dialog.Title>
                <div className="mt-4 space-y-4 text-gray-700 dark:text-gray-300">
                  <div>
                    <h3 className="text-sm font-semibold">Time</h3>
                    <p>
                      {formatInTimeZone(event.startUTC.toDate(), 'MMM d, h:mm a', timezone)}
                      {' - '}
                      {formatInTimeZone(event.endUTC.toDate(), 'h:mm a', timezone)}
                    </p>
                  </div>
                  {event.description && (
                    <div>
                      <h3 className="text-sm font-semibold">Description</h3>
                      <p className="whitespace-pre-wrap">{event.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-white transition-colors duration-200 bg-orange-500 rounded-md hover:bg-orange-600"
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EventDetailsModal;