import { DateTime, Interval } from 'luxon';

export const getMonthGrid = (date = new Date()) => {
  const monthStart = DateTime.fromJSDate(date).startOf('month');
  const gridStart = monthStart.startOf('week');

  const days = [];
  let currentDay = gridStart;

  for (let i = 0; i < 42; i++) {
    if (currentDay.month === monthStart.month) {
      days.push(currentDay.toJSDate());
    } else {
      days.push(null);
    }
    currentDay = currentDay.plus({ days: 1 });
  }
  return days;
};

export const generateAvailableSlots = (day, events, workingHours, duration, timezone) => {
    if (!workingHours || !workingHours.start || !workingHours.end || !day) {
        return [];
    }
    const dayStart = DateTime.fromJSDate(day, { zone: timezone }).set({
        hour: parseInt(workingHours.start.split(':')[0]),
        minute: parseInt(workingHours.start.split(':')[1]),
        second: 0, millisecond: 0
    });
    const dayEnd = dayStart.set({
        hour: parseInt(workingHours.end.split(':')[0]),
        minute: parseInt(workingHours.end.split(':')[1]),
    });
    const workingInterval = Interval.fromDateTimes(dayStart, dayEnd);
    if (!workingInterval.isValid) return [];
    
    const slots = workingInterval.splitBy({ minutes: duration });
    const nowInOwnerTimezone = DateTime.now().setZone(timezone);

    const eventIntervals = events.map(event =>
        Interval.fromDateTimes(
            DateTime.fromMillis(event.startUTC.toMillis()).setZone(timezone),
            DateTime.fromMillis(event.endUTC.toMillis()).setZone(timezone)
        )
    );

    return slots.map(slot => {
        const isBooked = eventIntervals.some(eventInterval => eventInterval.overlaps(slot));
        const isFuture = slot.start > nowInOwnerTimezone;
        if (!isBooked && isFuture) {
            return {
                start: slot.start.toUTC().toJSDate(),
                end: slot.end.toUTC().toJSDate(),
            };
        }
        return null;
    }).filter(Boolean);
};

export const formatInTimeZone = (date, fmt, tz) => {
    return DateTime.fromJSDate(date).setZone(tz).toFormat(fmt);
};

export const formatSimple = (date, fmt) => {
    return DateTime.fromJSDate(date).toFormat(fmt);
};