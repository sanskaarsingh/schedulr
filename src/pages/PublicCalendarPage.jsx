import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { DateTime } from 'luxon';
import CalendarGrid from '@/components/CalendarGrid';
import Loader from '@/components/Loader';
import toast from 'react-hot-toast';

const PublicCalendarPage = () => {
    const { shareToken } = useParams();
    const [calendar, setCalendar] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDate] = useState(new Date());

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        const fetchCalendar = async () => {
            try {
                if (!shareToken) {
                    setError("No share token provided in the URL.");
                    setLoading(false);
                    return;
                }
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
        const eventsQuery = query(collection(db, `calendars/${calendar.id}/events`), where('startUTC', '>=', monthStart), where('startUTC', '<=', monthEnd));
        const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
            setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }, (err) => { 
            console.error("Error fetching events:", err); 
            setError("Could not load calendar events."); 
        });
        return () => unsubscribe();
    }, [calendar, currentDate]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!calendar) { 
            toast.error("Calendar not loaded, please refresh."); 
            return; 
        }
        const toastId = toast.loading("Sending request...");
        try {
            const ownerTimezone = calendar.timezone || 'Asia/Kolkata';
            const startUTC = DateTime.fromISO(`${date}T${startTime}`, { zone: ownerTimezone }).toUTC();
            const endUTC = DateTime.fromISO(`${date}T${endTime}`, { zone: ownerTimezone }).toUTC();
            if (!startUTC.isValid || !endUTC.isValid || startUTC >= endUTC) { 
                throw new Error("Invalid date or time. Please check your inputs."); 
            }
            const calendarMonth = DateTime.fromJSDate(currentDate);
            if (startUTC.month !== calendarMonth.month || startUTC.year !== calendarMonth.year) { 
                throw new Error("You can only request bookings for the current month."); 
            }
            if (startUTC < DateTime.now()) { 
                throw new Error("You cannot request a booking in the past."); 
            }
            const requestsRef = collection(db, `calendars/${calendar.id}/booking_requests`);
            await addDoc(requestsRef, {
                requesterName: name, 
                requesterEmail: email, 
                title: title, 
                description: description,
                requestedStartUTC: Timestamp.fromMillis(startUTC.toMillis()),
                requestedEndUTC: Timestamp.fromMillis(endUTC.toMillis()),
                status: 'pending', 
                createdAt: serverTimestamp(),
            });
            toast.success("Booking request sent successfully!", { id: toastId });
            setName(''); setEmail(''); setTitle(''); setDescription(''); setDate(''); setStartTime(''); setEndTime('');
        } catch (error) { 
            toast.error(error.message || "Failed to send request.", { id: toastId }); 
        }
    };

    if (loading) return <Loader />;
    if (error) return <p className="text-center text-red-500">{error}</p>;
    if (!calendar) return <p className="text-center">Calendar not found.</p>;

    return (
        <div className="w-full">
            <h1 className="mb-2 text-3xl font-bold text-center dark:text-white">Book a Meeting</h1>
            <p className="mb-6 text-center text-gray-600 dark:text-gray-400">
                Check the owner's busy slots before making a request.
            </p>
            <div className="grid items-start gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <CalendarGrid currentDate={currentDate} events={events} isPublicView={true} />
                </div>
                <div className="bg-white dark:bg-[#1c1c1c] p-6 rounded-lg shadow-md border border-gray-200 dark:border-[#2a2a2a]">
                    <h3 className="mb-4 text-lg font-semibold dark:text-white">Request a Time Slot</h3>
                    <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Your Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Your Email</label>
                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Title</label>
                            <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" required className="w-full p-2 mt-1 border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full p-2 mt-1 bg-white border border-gray-300 rounded-md dark:border-gray-700 dark:bg-black dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium dark:text-gray-300">Requested Date</label>
                            <input value={date} onChange={(e) => setDate(e.target.value)} type="date" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/>
                        </div>
                        <div className="flex space-x-2">
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">Start Time</label>
                                <input value={startTime} onChange={(e) => setStartTime(e.target.value)} type="time" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium dark:text-gray-300">End Time</label>
                                <input value={endTime} onChange={(e) => setEndTime(e.target.value)} type="time" required className="mt-1 w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-black dark:text-white dark:[color-scheme:dark]"/>
                            </div>
                        </div>
                        <button type="submit" className="w-full py-2 text-white transition-colors duration-200 bg-orange-500 rounded-md hover:bg-orange-600">Send Booking Request</button>
                    </form>
                </div>
            </div>
        </div>
    );
};
export default PublicCalendarPage;