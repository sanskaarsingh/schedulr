import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, onSnapshot, updateDoc, serverTimestamp, runTransaction, addDoc, Timestamp, deleteDoc, writeBatch } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import toast from 'react-hot-toast';
import { formatInTimeZone } from '@/lib/helpers';
import { DateTime } from 'luxon';
import CalendarGrid from '@/components/CalendarGrid';
import Loader from '@/components/Loader';
import EditEventModal from '@/components/EditEventModal';
import EventDetailsModal from '@/components/EventDetailsModal';
import { FaCopy, FaSync } from 'react-icons/fa';

const DashboardPage = () => {
    const { user } = useAuth();
    const [calendar, setCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate] = useState(new Date());
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);

    useEffect(() => {
        if (!user) return;
        const fetchCalendar = async () => {
            setLoading(true);
            const q = query(collection(db, "calendars"), where("ownerUid", "==", user.uid));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) { const calDoc = querySnapshot.docs[0]; setCalendar({ id: calDoc.id, ...calDoc.data() }); }
            setLoading(false);
        };
        fetchCalendar();
    }, [user]);

    useEffect(() => {
        if (!calendar) return;
        const monthStart = DateTime.fromJSDate(currentDate).startOf('month').toJSDate();
        const monthEnd = DateTime.fromJSDate(currentDate).endOf('month').toJSDate();
        const eventsQuery = query(collection(db, `calendars/${calendar.id}/events`), where('startUTC', '>=', monthStart), where('startUTC', '<=', monthEnd));
        const unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => { setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))) }, (error) => { console.error("Event listener error:", error) });
        const requestsQuery = query(collection(db, `calendars/${calendar.id}/booking_requests`), where("status", "==", "pending"));
        const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => { setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))) });
        return () => { unsubscribeEvents(); unsubscribeRequests(); };
    }, [calendar, currentDate]);

    const handleOpenEditModal = (event) => { setEditingEvent(event); setIsEditModalOpen(true); };
    const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingEvent(null); };
    const handleOpenDetailsModal = (event) => { setSelectedEvent(event); setIsDetailsModalOpen(true); };
    const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedEvent(null); };

    const handleUpdateEvent = async (eventId, updatedData) => {
        const toastId = toast.loading("Updating event...");
        try {
            const ownerTimezone = calendar.timezone || 'Asia/Kolkata';
            const startUTC = DateTime.fromISO(`${updatedData.date}T${updatedData.startTime}`, { zone: ownerTimezone }).toUTC();
            const endUTC = DateTime.fromISO(`${updatedData.date}T${updatedData.endTime}`, { zone: ownerTimezone }).toUTC();
            if (!startUTC.isValid || !endUTC.isValid) { throw new Error("Invalid date or time."); }
            const eventRef = doc(db, `calendars/${calendar.id}/events`, eventId);
            await updateDoc(eventRef, {
                title: updatedData.title,
                description: updatedData.description,
                startUTC: Timestamp.fromMillis(startUTC.toMillis()),
                endUTC: Timestamp.fromMillis(endUTC.toMillis()),
            });
            toast.success("Event updated successfully!", { id: toastId });
            handleCloseEditModal();
        } catch (error) { toast.error(`Update failed: ${error.message}`, { id: toastId }); }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!calendar || !eventId) return;
        if (window.confirm("Are you sure you want to delete this event?")) {
            const eventRef = doc(db, `calendars/${calendar.id}/events`, eventId);
            try { await deleteDoc(eventRef); toast.success("Event deleted successfully."); } catch (error) { toast.error("Failed to delete event."); console.error("Error deleting event: ", error); }
        }
    };

    const handleConfirmRequest = async (request) => {
        const toastId = toast.loading('Confirming booking...');
        try {
            const eventsRef = collection(db, `calendars/${calendar.id}/events`);
            const conflictQuery = query(eventsRef, where('startUTC', '<', request.requestedEndUTC), where('endUTC', '>', request.requestedStartUTC));
            const conflictingEventsSnapshot = await getDocs(conflictQuery);
            if (!conflictingEventsSnapshot.empty) { throw new Error("This time slot is no longer available."); }
            const newEventRef = doc(eventsRef);
            const requestRef = doc(db, `calendars/${calendar.id}/booking_requests`, request.id);
            const newEventData = {
                title: request.title,
                description: request.description || "",
                startUTC: request.requestedStartUTC,
                endUTC: request.requestedEndUTC,
                createdAt: serverTimestamp(),
                meta: { requesterName: request.requesterName, requesterEmail: request.requesterEmail }
            };
            const batch = writeBatch(db);
            batch.set(newEventRef, newEventData);
            batch.update(requestRef, { status: 'confirmed' });
            await batch.commit();
            toast.success('Booking confirmed and event created!', { id: toastId });
        } catch (error) { console.error('Confirmation Error:', error); toast.error(`Confirmation failed: ${error.message}`, { id: toastId }); }
    };

    const handleAddManualEvent = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const ownerTimezone = calendar.timezone || 'Asia/Kolkata';
        const startUTC = DateTime.fromISO(`${formData.get('date')}T${formData.get('startTime')}`, { zone: ownerTimezone }).toUTC();
        const endUTC = DateTime.fromISO(`${formData.get('date')}T${formData.get('endTime')}`, { zone: ownerTimezone }).toUTC();
        if (!startUTC.isValid || !endUTC.isValid) { toast.error("Invalid date or time entered."); return; }
        const calendarMonth = DateTime.fromJSDate(currentDate);
        if (startUTC.month !== calendarMonth.month || startUTC.year !== calendarMonth.year) { toast.error("You can only add events for the current month shown on the calendar."); return; }
        const toastId = toast.loading('Adding event...');
        try {
            await addDoc(collection(db, `calendars/${calendar.id}/events`), {
                title: formData.get('title'),
                description: formData.get('description'),
                startUTC: Timestamp.fromMillis(startUTC.toMillis()),
                endUTC: Timestamp.fromMillis(endUTC.toMillis()),
                createdAt: serverTimestamp(),
                meta: { createdBy: 'owner' }
            });
            toast.success('Event added successfully!', { id: toastId });
            e.target.reset();
        } catch (error) { toast.error(`Failed to add event: ${error.message}`, { id: toastId }); }
    };

    const handleRotateToken = async () => { if (!calendar) return; const newShareToken = nanoid(12); await updateDoc(doc(db, 'calendars', calendar.id), { shareToken: newShareToken }); setCalendar(prev => ({ ...prev, shareToken: newShareToken })); toast.success('Share link token has been updated!'); };
    const handleCopyToClipboard = () => { const url = `${window.location.origin}/c/${calendar.shareToken}`; navigator.clipboard.writeText(url); toast.success('Share link copied to clipboard!'); };
    const handleRejectRequest = async (requestId) => { await updateDoc(doc(db, `calendars/${calendar.id}/booking_requests`, requestId), { status: 'rejected' }); toast.success('Booking request rejected.'); };
    
    if (loading) return <Loader />;
    if (!calendar) return <p>No calendar found.</p>;

    return (
        <div className="w-full space-y-8">
            <h1 className="text-3xl font-bold dark:text-white">Dashboard</h1>
            
            <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#2a2a2a]">
                <h2 className="mb-4 text-xl font-semibold dark:text-white">Calendar Settings</h2>
                <div className="flex items-center space-x-4">
                    <input type="text" readOnly value={`${window.location.origin}/c/${calendar.shareToken}`} className="flex-grow p-2 bg-gray-100 border rounded-md dark:bg-black dark:border-gray-700 dark:text-gray-300" />
                    <button onClick={handleCopyToClipboard} title="Copy link" className="p-3 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"><FaCopy /></button>
                    <button onClick={handleRotateToken} title="Generate new link" className="p-3 bg-yellow-200 rounded-md hover:bg-yellow-300 dark:bg-yellow-600 dark:hover:bg-yellow-500"><FaSync /></button>
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Your timezone is set to: <strong>{calendar.timezone}</strong>. All times are displayed in this timezone.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <CalendarGrid 
                        currentDate={currentDate} 
                        events={events} 
                        onDeleteEvent={handleDeleteEvent}
                        onOpenEditModal={handleOpenEditModal}
                        onOpenDetailsModal={handleOpenDetailsModal}
                    />
                </div>
                <div>
                     <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#2a2a2a]">
                        <h3 className="mb-4 text-lg font-semibold dark:text-white">Add Manual Event</h3>
                        <form onSubmit={handleAddManualEvent} className="space-y-4">
                           <div><label className="block text-sm font-medium dark:text-gray-300">Title</label><input name="title" type="text" required className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white"/></div>
                           <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Description</label>
                                <textarea name="description" rows={3} className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white"/>
                           </div>
                           <div><label className="block text-sm font-medium dark:text-gray-300">Date</label><input name="date" type="date" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/></div>
                           <div className="flex space-x-2">
                               <div><label className="block text-sm font-medium dark:text-gray-300">Start Time</label><input name="startTime" type="time" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/></div>
                               <div><label className="block text-sm font-medium dark:text-gray-300">End Time</label><input name="endTime" type="time" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/></div>
                           </div>
                           <button type="submit" className="w-full py-2 text-white transition-colors duration-200 bg-orange-500 rounded-md hover:bg-orange-600">Add Event</button>
                        </form>
                     </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#2a2a2a]">
                <h2 className="mb-4 text-xl font-semibold dark:text-white">Pending Booking Requests</h2>
                {requests.length > 0 ? (
                    <ul className="space-y-4">
                        {requests.map(req => (
                            <li key={req.id} className="flex items-center justify-between p-4 border rounded-md dark:border-gray-700">
                                <div>
                                    <p className="font-semibold dark:text-white">{req.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        From: {req.requesterName} ({req.requesterEmail})
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        Requested:{' '}
                                        <span className="font-medium">
                                            {formatInTimeZone(req.requestedStartUTC.toDate(), 'MMM d, h:mm a', calendar.timezone)}
                                        </span>
                                    </p>
                                </div>
                                <div className="space-x-2">
                                    <button onClick={() => handleConfirmRequest(req)} className="px-3 py-1 text-sm text-white transition-colors duration-200 bg-green-500 rounded-md hover:bg-green-600">Confirm</button>
                                    <button onClick={() => handleRejectRequest(req.id)} className="px-3 py-1 text-sm text-white transition-colors duration-200 bg-red-500 rounded-md hover:bg-red-600">Reject</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (<p className="text-gray-500 dark:text-gray-400">No pending requests.</p>)}
            </div>
            
            <EditEventModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} event={editingEvent} onUpdateEvent={handleUpdateEvent} timezone={calendar?.timezone || 'Asia/Kolkata'} />
            <EventDetailsModal isOpen={isDetailsModalOpen} onClose={handleCloseDetailsModal} event={selectedEvent} timezone={calendar?.timezone || 'Asia/Kolkata'} />
        </div>
    );
};
export default DashboardPage;