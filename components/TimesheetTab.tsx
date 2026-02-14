
import React, { useState } from 'react';
import { Plus, Trash2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { TimesheetEntry, WorkType, Settings } from '../types';
import { calculateWorkedHours, formatDecimalHours, parseLocalISO } from '../utils/helpers';

interface Props {
  entries: TimesheetEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TimesheetEntry[]>>;
  settings: Settings;
}

const TimesheetTab: React.FC<Props> = ({ entries, setEntries, settings }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TimesheetEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: settings.defaultBreak,
    type: WorkType.NORMAL
  });

  const handleTypeChange = (type: WorkType) => {
    if (type === WorkType.PUBLIC_HOLIDAY) {
      setFormData(prev => ({
        ...prev,
        type,
        startTime: '00:00',
        endTime: '07:30', 
        breakMinutes: 0,
        workedHours: settings.publicHolidayHours
      }));
    } else {
      setFormData(prev => ({ ...prev, type, breakMinutes: settings.defaultBreak }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const worked = formData.type === WorkType.PUBLIC_HOLIDAY 
      ? settings.publicHolidayHours 
      : calculateWorkedHours(formData.startTime!, formData.endTime!, formData.breakMinutes!);

    const newEntry: TimesheetEntry = {
      id: crypto.randomUUID(),
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      breakMinutes: formData.breakMinutes!,
      type: formData.type as WorkType,
      workedHours: worked
    };

    setEntries(prev => [newEntry, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Delete this entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Timesheet</h2>
          <p className="text-slate-500 text-sm">Log your daily work activity</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Log Time</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Work Type</label>
              <select 
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as WorkType)}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {Object.values(WorkType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(p => ({...p, date: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {formData.type !== WorkType.PUBLIC_HOLIDAY && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Start Time</label>
                  <input 
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(p => ({...p, startTime: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">End Time</label>
                  <input 
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(p => ({...p, endTime: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Break (mins)</label>
                  <input 
                    type="number"
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData(p => ({...p, breakMinutes: parseInt(e.target.value) || 0}))}
                    className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </>
            )}
            
            {formData.type === WorkType.PUBLIC_HOLIDAY && (
              <div className="md:col-span-2 bg-blue-50 p-3 rounded-lg flex items-center gap-3 text-blue-700 text-sm">
                <AlertCircle size={18} />
                <span>Public holiday will automatically record <strong>{settings.publicHolidayHours} hours</strong>.</span>
              </div>
            )}
          </div>
          <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Save Entry
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 hidden sm:table-cell">Duration</th>
              <th className="px-6 py-4">Worked</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <Clock className="w-12 h-12 mb-3 opacity-20" />
                    <p>No entries yet. Start logging your time!</p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium">{format(parseLocalISO(entry.date), 'EEE, MMM d')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      entry.type === WorkType.PUBLIC_HOLIDAY ? 'bg-amber-100 text-amber-700' :
                      entry.type === WorkType.LEAVE ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-sm text-slate-500">
                    {entry.type === WorkType.NORMAL ? `${entry.startTime} - ${entry.endTime}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-700">
                    {formatDecimalHours(entry.workedHours)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => deleteEntry(entry.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetTab;
