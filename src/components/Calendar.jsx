import React, { useState } from 'react';
import dayjs from 'dayjs';
import events from '../data/events.json';

const parseDuration = (str) => {
  const hMatch = str.match(/(\d+)h/);
  const mMatch = str.match(/(\d+)m/);
  return {
    hours: hMatch ? parseInt(hMatch[1]) : 0,
    minutes: mMatch ? parseInt(mMatch[1]) : 0,
  };
};

const isOverlapping = (event1, event2) => {
  const start1 = dayjs(`${event1.date} ${event1.time}`);
  const duration1 = parseDuration(event1.duration);
  const end1 = start1.add(duration1.hours, 'hour').add(duration1.minutes, 'minute');

  const start2 = dayjs(`${event2.date} ${event2.time}`);
  const duration2 = parseDuration(event2.duration);
  const end2 = start2.add(duration2.hours, 'hour').add(duration2.minutes, 'minute');

  return start1.isBefore(end2) && end1.isAfter(start2);
};

const getIcon = (title) => {
  const t = title.toLowerCase();
  if (t.includes("call")) return "📞";
  if (t.includes("meeting")) return "👥";
  if (t.includes("review")) return "📝";
  if (t.includes("workshop")) return "🧠";
  return "📅";
};

const getEventColor = (idx, conflict) => {
  if (conflict) return 'bg-red-500';
  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
  return colors[idx % colors.length];
};

const Calendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const today = dayjs();

  const startOfMonth = currentMonth.startOf('month');
  const endOfMonth = currentMonth.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const days = [];
  let day = startDate;

  while (day.isBefore(endDate, 'day') || day.isSame(endDate, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const getDayEvents = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayEvents = events.filter(e => e.date === dateStr);
    return dayEvents.map((event, i, arr) => {
      const hasConflict = arr.some((e2, j) => i !== j && isOverlapping(event, e2));
      return { ...event, conflict: hasConflict };
    });
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 bg-gradient-to-br from-white to-gray-100 text-gray-900 font-sans rounded-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-10">
        <button
          onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 hover:scale-105 transition transform shadow-sm"
        >
          <span className="text-xl">←</span>
          <span className="text-sm font-medium hidden sm:inline">Previous</span>
        </button>

        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-center flex-1 min-w-[200px]">
          📅 {currentMonth.format('MMMM YYYY')}
        </h2>

        <button
          onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 hover:scale-105 transition transform shadow-sm"
        >
          <span className="text-sm font-medium hidden sm:inline">Next</span>
          <span className="text-xl">→</span>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 uppercase border-y py-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
          <div key={idx}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mt-4">
        {days.map((d, i) => {
          const dayEvents = getDayEvents(d);
          const isToday = d.isSame(today, 'day');
          const isCurrentMonth = d.isSame(currentMonth, 'month');

          return (
            <div
              key={i}
              className={`rounded-xl p-3 border shadow-sm transition-all duration-200 flex flex-col justify-between ${
                isToday
                  ? 'bg-gradient-to-tr from-emerald-100 via-teal-200 to-emerald-50 text-gray-800 ring-2 ring-emerald-400 shadow-lg'
                  : 'bg-white text-gray-900'
              } ${!isCurrentMonth ? 'opacity-40' : ''} min-h-[140px] max-h-[200px] sm:min-h-[160px] sm:max-h-[200px]`}
            >
              {/* Stamped Date */}
              <div className="relative w-fit mx-auto mb-2">
                <span className={`relative text-sm font-bold px-3 py-1 rounded-full z-10 ${
                  isToday
                    ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-300'
                    : 'text-gray-800'
                }`}>
                  {d.date()}
                </span>
                {isToday && (
                  <span className="absolute left-1/2 transform -translate-x-1/2 text-[10px] mt-1 text-red-700 font-semibold">
                    Today
                  </span>
                )}
              </div>

              {/* Events */}
              <div className="space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {dayEvents.map((e, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl text-xs font-medium text-white shadow-lg cursor-pointer ${getEventColor(idx, e.conflict)} hover:scale-[1.02] transition`}
                    title={`${e.title} (${e.time}, ${e.duration})`}
                    onClick={() => setSelectedEvent(e)}
                  >
                    <div className="flex items-start gap-1">
                      <div className="text-lg leading-none">{getIcon(e.title)}</div>
                      <div className="flex-1">
                        <div className="font-semibold truncate">{e.title}</div>
                        <div className="flex items-center gap-1 text-[10px] text-white/90">
                          <span className="h-2 w-2 rounded-full bg-white/70 inline-block"></span>
                          {e.time} • {e.duration}
                        </div>
                        {e.conflict && (
                          <div className="text-yellow-200 text-[9px] italic mt-1">⚠ Conflict</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md relative">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-2 right-3 text-xl font-bold text-gray-500 hover:text-gray-800"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
              {getIcon(selectedEvent.title)} {selectedEvent.title}
            </h3>
            <p className="text-sm text-gray-700 mb-1">
              📅 <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              ⏰ <strong>Time:</strong> {selectedEvent.time}
            </p>
            <p className="text-sm text-gray-700 mb-1">
              ⏳ <strong>Duration:</strong> {selectedEvent.duration}
            </p>
            {selectedEvent.conflict && (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                ⚠ This event overlaps with another one.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
