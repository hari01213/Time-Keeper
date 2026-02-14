
export enum WorkType {
  NORMAL = 'Normal',
  PUBLIC_HOLIDAY = 'Public Holiday',
  LEAVE = 'Leave',
  SATURDAY = 'Saturday',
  SUNDAY = 'Sunday'
}

export enum EmploymentType {
  REGULAR = 'Regular',
  CASUAL = 'Casual'
}

export interface TimesheetEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  type: WorkType;
  workedHours: number;
  hourlyRateAtTime: number; // The specific rate (with multipliers) for this entry
  totalEarned: number; // workedHours * hourlyRateAtTime
}

export interface PayRecord {
  id: string;
  startDate: string;
  endDate: string;
  hoursPaid: number;
  notes?: string;
}

export interface Settings {
  employmentType: EmploymentType;
  standardDailyHours: number;
  defaultBreak: number;
  basePayRate: number;
  casualLoadingMultiplier: number; // e.g. 1.25
  multiplierSaturday: number;
  multiplierSunday: number;
  multiplierPublicHoliday: number;
  publicHolidayHours: number;
  fortnightAnchorDate: string;
}

export type TabType = 'timesheet' | 'payroll' | 'settings';
