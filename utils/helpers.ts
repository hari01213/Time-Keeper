
import { format, differenceInMinutes, getDay } from 'date-fns';
import { WorkType, Settings, EmploymentType } from '../types';

export const parseLocalISO = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const getActualRate = (dateStr: string, type: WorkType, settings: Settings): number => {
  const base = settings.basePayRate || 0;
  const loading = settings.employmentType === EmploymentType.CASUAL ? settings.casualLoadingMultiplier : 1;
  
  const date = parseLocalISO(dateStr);
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

  let multiplier = 1;
  
  // Public Holiday takes precedence
  if (type === WorkType.PUBLIC_HOLIDAY) {
    multiplier = settings.multiplierPublicHoliday;
  } else if (dayOfWeek === 6) { // Saturday
    multiplier = settings.multiplierSaturday;
  } else if (dayOfWeek === 0) { // Sunday
    multiplier = settings.multiplierSunday;
  }
  
  // Compounded rate calculation: Base * Loading (if casual) * Penalty Multiplier
  return base * loading * multiplier;
};

export const getRateBreakdown = (dateStr: string, type: WorkType, settings: Settings): string => {
  const date = parseLocalISO(dateStr);
  const dayOfWeek = date.getDay();
  const loading = settings.employmentType === EmploymentType.CASUAL ? settings.casualLoadingMultiplier : 1;
  
  let multiplier = 1;
  if (type === WorkType.PUBLIC_HOLIDAY) multiplier = settings.multiplierPublicHoliday;
  else if (dayOfWeek === 6) multiplier = settings.multiplierSaturday;
  else if (dayOfWeek === 0) multiplier = settings.multiplierSunday;

  const totalMult = loading * multiplier;
  return `Base: ${formatCurrency(settings.basePayRate)} × ${totalMult.toFixed(2)}`;
};

/**
 * Simplified AU Tax for Foreign Residents (Non-Medicare) 2024-25
 */
export const calculateTax = (grossAmount: number): number => {
  if (grossAmount <= 0) return 0;
  
  const annual = grossAmount * 26;
  let tax = 0;

  if (annual <= 135000) {
    tax = annual * 0.30;
  } else if (annual <= 190000) {
    tax = (135000 * 0.30) + ((annual - 135000) * 0.37);
  } else {
    tax = (135000 * 0.30) + (55000 * 0.37) + ((annual - 190000) * 0.45);
  }

  return tax / 26; 
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

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount);
};
