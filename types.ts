
export enum WorkType {
  NORMAL = 'Normal',
  PUBLIC_HOLIDAY = 'Public Holiday',
  LEAVE = 'Leave'
}

export interface TimesheetEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  breakMinutes: number;
  type: WorkType;
  workedHours: number;
}

export interface PayRecord {
  id: string;
  startDate: string;
  endDate: string;
  hoursPaid: number;
  notes?: string;
}

export interface Settings {
  standardDailyHours: number;
  defaultBreak: number;
  publicHolidayHours: number;
  fortnightAnchorDate: string; // The start of some pay period to calculate others
}

export type TabType = 'timesheet' | 'pay' | 'summary' | 'settings';
