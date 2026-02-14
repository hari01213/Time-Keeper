
import { format, differenceInMinutes } from 'date-fns';

/**
 * Parses YYYY-MM-DD strings safely in local time to avoid timezone shifts.
 */
export const parseLocalISO = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const timeToDecimal = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
};

export const calculateWorkedHours = (
  startTime: string,
  endTime: string,
  breakMins: number
): number => {
  if (!startTime || !endTime) return 0;
  
  const [sH, sM] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(sH, sM, 0, 0);
  
  const [eH, eM] = endTime.split(':').map(Number);
  const end = new Date();
  end.setHours(eH, eM, 0, 0);
  
  let diff = differenceInMinutes(end, start);
  if (diff < 0) diff += 24 * 60; 
  
  const total = (diff - breakMins) / 60;
  return Math.max(0, total);
};

export const formatDecimalHours = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h}h ${m}m`;
};

export const getFortnightBounds = (date: Date, anchorDate: Date): { start: Date; end: Date } => {
  const diffInDays = Math.floor((date.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
  const fortnightIndex = Math.floor(diffInDays / 14);
  const start = new Date(anchorDate);
  start.setDate(start.getDate() + (fortnightIndex * 14));
  const end = new Date(start);
  end.setDate(end.getDate() + 13);
  
  const startResult = new Date(start);
  startResult.setHours(0, 0, 0, 0);
  const endResult = new Date(end);
  endResult.setHours(0, 0, 0, 0);
  
  return { start: startResult, end: endResult };
};
