// src/components/BookingModal.jsx
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { formatSimple as format } from '@/lib/helpers';
import toast from 'react-hot-toast';

const BookingModal = ({ isOpen, onClose, slot, timeZone, onBookingSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!slot) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onBookingSubmit({
        requesterName: name,
        requesterEmail: email,
        message,
        requestedStartUTC: slot.start,
        requestedEndUTC: slot.end,
      });
      toast.success('Booking request sent successfully!');
      onClose();
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error(error.message || 'Failed to send booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold">Request a Booking</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            You are requesting the slot for{' '}
            <span className="font-semibold text-indigo-600">
              {format(slot.start, 'MMMM d, yyyy')} from {format(slot.start, 'h:mm a')} to {format(slot.end, 'h:mm a')}
            </span> ({timeZone}).
          </Dialog.Description>
          <p className="mt-1 text-xs text-gray-500">This booking is a request — owner must confirm. You will be notified by email if confirmed.</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
             <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Optional Message</label>
              <textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Request Slot'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default BookingModal;