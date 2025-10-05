// src/components/EditEventModal.jsx
import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { DateTime } from 'luxon';
import toast from 'react-hot-toast';

const EditEventModal = ({ isOpen, onClose, event, onUpdateEvent, timezone }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // When the event prop changes, pre-fill the form
  useEffect(() => {
    if (event) {
      const startDateTime = DateTime.fromJSDate(event.startUTC.toDate(), { zone: timezone });
      const endDateTime = DateTime.fromJSDate(event.endUTC.toDate(), { zone: timezone });
      
      setTitle(event.title);
      setDate(startDateTime.toFormat('yyyy-MM-dd'));
      setStartTime(startDateTime.toFormat('HH:mm'));
      setEndTime(endDateTime.toFormat('HH:mm'));
    }
  }, [event, timezone]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateEvent(event.id, { title, date, startTime, endTime });
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center w-screen p-4">
        <Dialog.Panel className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <Dialog.Title className="text-xl font-bold">Edit Event</Dialog.Title>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" required className="w-full p-2 mt-1 border rounded-md"/>
            </div>
            <div>
              <label className="block text-sm font-medium">Date</label>
              <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required className="w-full p-2 mt-1 border rounded-md"/>
            </div>
            <div className="flex space-x-2">
              <div>
                <label className="block text-sm font-medium">Start Time</label>
                <input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" required className="w-full p-2 mt-1 border rounded-md"/>
              </div>
              <div>
                <label className="block text-sm font-medium">End Time</label>
                <input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" required className="w-full p-2 mt-1 border rounded-md"/>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Save Changes</button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default EditEventModal;