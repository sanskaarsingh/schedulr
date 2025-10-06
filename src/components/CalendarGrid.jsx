import { DateTime } from 'luxon';
import { getMonthGrid } from '@/lib/helpers';
import { FaTrash, FaPencilAlt } from 'react-icons/fa';

const CalendarGrid = ({
  currentDate,
  events,
  onDeleteEvent,
  onOpenEditModal,
  onOpenDetailsModal,
  isPublicView = false,
}) => {
  const daysInGrid = getMonthGrid(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-[#1c1c1c] p-4 rounded-lg shadow border border-gray-200 dark:border-[#2a2a2a] transition-colors duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">{DateTime.fromJSDate(currentDate).toFormat('MMMM yyyy')}</h2>
      </div>
      <div className="grid grid-cols-7 gap-1 font-semibold text-center text-gray-600 dark:text-gray-300">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {daysInGrid.map((day, index) => (
          <div key={index} className={`border dark:border-[#2a2a2a] rounded p-2 h-40 overflow-y-auto ${day ? 'bg-white dark:bg-[#1c1c1c]' : 'bg-gray-100 dark:bg-black/20'}`}>
            {day && (
              <>
                <div className={`text-sm font-bold ${DateTime.fromJSDate(day).hasSame(DateTime.now(), 'day') ? 'text-orange-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {DateTime.fromJSDate(day).toFormat('d')}
                </div>
                <div className="mt-1 space-y-1">
                  {events
                    .filter(event => DateTime.fromJSDate(event.startUTC.toDate()).hasSame(DateTime.fromJSDate(day), 'day'))
                    .map(event => (
                      <div key={event.id}
                        className="flex items-center justify-between p-1 text-xs text-red-800 transition-colors duration-200 bg-red-100 rounded cursor-pointer hover:bg-red-200"
                        onClick={() => !isPublicView && onOpenDetailsModal(event)}
                      >
                        <span className="truncate">{isPublicView ? "Busy" : event.title}</span>
                        {!isPublicView && (
                          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                            <button onClick={() => onOpenEditModal(event)} className="text-blue-600 transition-colors duration-200 hover:text-orange-500">
                                <FaPencilAlt />
                            </button>
                            <button onClick={() => onDeleteEvent(event.id)} className="text-red-600 transition-colors duration-200 hover:text-red-800">
                                <FaTrash />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
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