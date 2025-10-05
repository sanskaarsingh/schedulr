import { DateTime } from 'luxon';
import { getMonthGrid, generateAvailableSlots, formatSimple } from '@/lib/helpers';
import { FaTrash, FaPencilAlt } from 'react-icons/fa'; // Import FaPencilAlt

const CalendarGrid = ({
  currentDate,
  events,
  onDeleteEvent,
  onOpenEditModal, // New prop
  isPublicView = false,
  // ... other props
}) => {
  const daysInGrid = getMonthGrid(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}</h2>
      </div>
      <div className="grid grid-cols-7 gap-1 font-semibold text-center text-gray-600">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 font-semibold text-center text-gray-600 dark:text-gray-300">
    {daysOfWeek.map(day => <div key={day}>{day}</div>)}
  </div>
  <div className="grid grid-cols-7 gap-1 mt-2">
    {daysInGrid.map((day, index) => (
      <div key={index} className={`border dark:border-gray-700 rounded p-2 h-40 overflow-y-auto ${day ? 'bg-white dark:bg-gray-800' : 'bg-gray-100 dark:bg-gray-800/50'}`}>
        {day && (
          <>
            <div className={`text-sm font-bold ${DateTime.fromJSDate(day).hasSame(DateTime.now(), 'day') ? 'text-indigo-600' : 'text-gray-700 dark:text-gray-300'}`}>
                  {DateTime.fromJSDate(day).toFormat('d')}
                </div>
                <div className="mt-1 space-y-1">
                  {events
                    .filter(event => DateTime.fromJSDate(event.startUTC.toDate()).hasSame(DateTime.fromJSDate(day), 'day'))
                    .map(event => (
                      <div key={event.id} className="flex items-center justify-between p-1 text-xs text-red-800 bg-red-100 rounded">
                        <span className="truncate">{event.title}</span>
                        {!isPublicView && (
                          <div className="flex items-center space-x-2">
                            <button onClick={() => onOpenEditModal(event)} className="text-blue-600 hover:text-blue-800">
                                <FaPencilAlt />
                            </button>
                            <button onClick={() => onDeleteEvent(event.id)} className="text-red-600 hover:text-red-800">
                                <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  {/* ... code for public view slots */}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default CalendarGrid;