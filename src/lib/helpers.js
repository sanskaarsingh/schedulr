import { DateTime } from 'luxon';

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

export const formatInTimeZone = (date, fmt, tz) => {
    return DateTime.fromJSDate(date).setZone(tz).toFormat(fmt);
};

export const formatSimple = (date, fmt) => {
    return DateTime.fromJSDate(date).toFormat(fmt);
};