import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';
import CalendarGrid from '@/components/CalendarGrid';
import BookingModal from '@/components/BookingModal';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

const PublicCalendarPage = () => {
    const { shareToken } = useParams();
    const [calendar, setCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                const q = query(collection(db, "calendars"), where("shareToken", "==", shareToken));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.empty) {
                    setError("This share link is invalid or has expired.");
                } else {
                    const calDoc = querySnapshot.docs[0];
                    setCalendar({ id: calDoc.id, ...calDoc.data() });
                }
            } catch (err) {
                setError("Failed to load calendar data.");
            } finally {
                setLoading(false);
            }
        };
        fetchCalendar();
    }, [shareToken]);

    useEffect(() => {
        if (!calendar) return;
        const monthStart = DateTime.fromJSDate(currentDate).startOf('month').toJSDate();
        const monthEnd = DateTime.fromJSDate(currentDate).endOf('month').toJSDate();
        const eventsQuery = query(
            collection(db, `calendars/${calendar.id}/events`),
            where('startUTC', '>=', monthStart), where('startUTC', '<=', monthEnd)
        );
        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (err) => {
            console.error("Error fetching events:", err);
            setError("Could not load calendar events.");
        });
        return () => unsubscribe();
    }, [calendar, currentDate]);

    const handleSlotClick = (slot) => {
        setSelectedSlot(slot);
        setIsModalOpen(true);
    };

    const handleBookingSubmit = async (bookingData) => {
        if (!calendar) return;
        const requestsRef = collection(db, `calendars/${calendar.id}/booking_requests`);
        await addDoc(requestsRef, {
            ...bookingData,
            requestedStartUTC: Timestamp.fromDate(bookingData.requestedStartUTC),
            requestedEndUTC: Timestamp.fromDate(bookingData.requestedEndUTC),
            status: 'pending',
            createdAt: serverTimestamp(),
        });
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!calendar) return <p className="text-center">Calendar not found.</p>;

    return (
        <div>
            <h1 className="mb-2 text-3xl font-bold text-center">Book a Meeting</h1>
            <p className="mb-6 text-center text-gray-600">
                Select an available slot to request a booking. All times are shown in your local timezone (
                {Intl.DateTimeFormat().resolvedOptions().timeZone}).
            </p>
            <CalendarGrid
                currentDate={currentDate}
                events={events}
                workingHours={calendar.workingHours}
                duration={calendar.defaultDurationMinutes}
                timezone={calendar.timezone}
                isPublicView={true}
                onSlotClick={handleSlotClick}
            />
            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                slot={selectedSlot}
                timeZone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                onBookingSubmit={handleBookingSubmit}
            />
        </div>
    );
};
export default PublicCalendarPage;