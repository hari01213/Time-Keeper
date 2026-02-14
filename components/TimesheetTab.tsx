
import React, { useState } from 'react';
import { Plus, Trash2, Clock, CalendarRange, Edit3, Save, X, Calculator, Check, Copy } from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { TimesheetEntry, WorkType, Settings, EmploymentType } from '../types';
import { calculateWorkedHours, formatDecimalHours, parseLocalISO, getActualRate, formatCurrency, getRateBreakdown } from '../utils/helpers';

interface Props {
  entries: TimesheetEntry[];
  setEntries: React.Dispatch<React.SetStateAction<TimesheetEntry[]>>;
  settings: Settings;
}

const TimesheetTab: React.FC<Props> = ({ entries, setEntries, settings }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copyingEntry, setCopyingEntry] = useState<TimesheetEntry | null>(null);
  const [selectedCopyDays, setSelectedCopyDays] = useState<string[]>([]);

  const [formData, setFormData] = useState<Partial<TimesheetEntry>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: settings.defaultBreak,
    type: WorkType.NORMAL
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const worked = formData.type === WorkType.PUBLIC_HOLIDAY 
      ? settings.publicHolidayHours 
      : calculateWorkedHours(formData.startTime!, formData.endTime!, formData.breakMinutes!);

    const rate = getActualRate(formData.date!, formData.type as WorkType, settings);

    const entryData: TimesheetEntry = {
      id: editingId || crypto.randomUUID(),
      date: formData.date!,
      startTime: formData.startTime!,
      endTime: formData.endTime!,
      breakMinutes: formData.breakMinutes!,
      type: formData.type as WorkType,
      workedHours: worked,
      hourlyRateAtTime: rate,
      totalEarned: worked * rate
    };

    if (editingId) {
      setEntries(prev => prev.map(e => e.id === editingId ? entryData : e).sort((a, b) => b.date.localeCompare(a.date)));
    } else {
      setEntries(prev => [entryData, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: settings.defaultBreak,
      type: WorkType.NORMAL
    });
  };

  const handleEdit = (entry: TimesheetEntry) => {
    setEditingId(entry.id);
    setFormData(entry);
    setShowForm(true);
  };

  const startCopySession = (entry: TimesheetEntry) => {
    setCopyingEntry(entry);
    setSelectedCopyDays([]);
  };

  const executeCopy = () => {
    if (!copyingEntry) return;
    
    const newEntries: TimesheetEntry[] = selectedCopyDays.map(dateStr => {
      const rate = getActualRate(dateStr, copyingEntry.type, settings);
      const worked = copyingEntry.type === WorkType.PUBLIC_HOLIDAY 
        ? settings.publicHolidayHours 
        : calculateWorkedHours(copyingEntry.startTime, copyingEntry.endTime, copyingEntry.breakMinutes);

      return {
        ...copyingEntry,
        id: crypto.randomUUID(),
        date: dateStr,
        hourlyRateAtTime: rate,
        totalEarned: worked * rate
      };
    });

    setEntries(prev => [...newEntries, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    setCopyingEntry(null);
  };

  const deleteEntry = (id: string) => {
    if (confirm('Delete this entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  // Live calculation for the form
  const currentActualRate = getActualRate(formData.date!, formData.type as WorkType, settings);
  const breakdown = getRateBreakdown(formData.date!, formData.type as WorkType, settings);
  const dayOfWeek = parseLocalISO(formData.date!).getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Timesheet</h2>
          <p className="text-slate-500 text-sm font-medium">Log and manage your daily work activity</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={20} /> Log Time
          </button>
        )}
      </div>

      {/* Selective Copy Modal */}
      {copyingEntry && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b bg-indigo-50 flex justify-between items-center">
              <div>
                <h3 className="font-black text-indigo-900">Copy Log Entry</h3>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest mt-0.5">Select days to duplicate</p>
              </div>
              <button onClick={() => setCopyingEntry(null)} className="text-indigo-400 hover:text-indigo-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500 font-medium bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                Copying: {copyingEntry.startTime} - {copyingEntry.endTime} ({copyingEntry.type})
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                  const monday = startOfWeek(parseLocalISO(copyingEntry.date), { weekStartsOn: 1 });
                  return Array.from({ length: 7 }).map((_, i) => {
                    const day = addDays(monday, i);
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isAlreadyLogged = entries.some(e => e.date === dateStr);
                    const isSource = dateStr === copyingEntry.date;

                    return (
                      <label 
                        key={dateStr}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                          isSource ? 'opacity-50 border-slate-100 cursor-not-allowed' :
                          isAlreadyLogged ? 'border-rose-100 bg-rose-50 text-rose-800' :
                          selectedCopyDays.includes(dateStr) ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 
                          'border-slate-100 bg-white hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            disabled={isSource}
                            checked={selectedCopyDays.includes(dateStr)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedCopyDays(prev => [...prev, dateStr]);
                              else setSelectedCopyDays(prev => prev.filter(d => d !== dateStr));
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-sm">{format(day, 'EEEE')}</span>
                            <span className="text-[10px] uppercase font-black opacity-40">{format(day, 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                        {isAlreadyLogged && <span className="text-[9px] font-black uppercase bg-rose-100 px-2 py-1 rounded text-rose-600">Entry Exists</span>}
                        {isSource && <span className="text-[9px] font-black uppercase bg-slate-100 px-2 py-1 rounded text-slate-400">Source</span>}
                      </label>
                    );
                  });
                })()}
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex gap-3">
              <button onClick={() => setCopyingEntry(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Cancel</button>
              <button 
                onClick={executeCopy}
                disabled={selectedCopyDays.length === 0}
                className="flex-2 flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-black disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
              >
                <Check size={18} /> COPY TO {selectedCopyDays.length} DAYS
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-2xl text-slate-900">{editingId ? 'Edit Entry' : 'New Log Entry'}</h3>
            <button type="button" onClick={resetForm} className="text-slate-300 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
              <X size={28}/>
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <input 
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(p => ({...p, date: e.target.value}))}
                className={`w-full border-2 rounded-2xl px-5 py-4 bg-slate-50 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all ${isWeekend ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100'}`}
              />
              {isWeekend && (
                <div className="flex items-center gap-2 text-amber-600">
                  <Calculator size={14} />
                  <p className="text-[10px] font-black uppercase tracking-tight">
                    {dayOfWeek === 6 ? 'Saturday' : 'Sunday'} Rates detected
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Work Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as WorkType}))}
                className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
              >
                <option value={WorkType.NORMAL}>Normal Work Day</option>
                <option value={WorkType.PUBLIC_HOLIDAY}>Public Holiday</option>
                <option value={WorkType.LEAVE}>Sick / Annual Leave</option>
              </select>
            </div>

            {formData.type !== WorkType.PUBLIC_HOLIDAY && (
              <>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                  <input 
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(p => ({...p, startTime: e.target.value}))}
                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">End Time</label>
                  <input 
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(p => ({...p, endTime: e.target.value}))}
                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Break (mins)</label>
                  <input 
                    type="number"
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData(p => ({...p, breakMinutes: parseInt(e.target.value) || 0}))}
                    className="w-full border-2 border-slate-100 rounded-2xl px-5 py-4 bg-slate-50 text-lg font-bold focus:ring-4 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-10 p-8 bg-indigo-50/50 rounded-3xl border-2 border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-6">
             <div>
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Live Rate Preview</p>
               <p className="text-sm font-bold text-slate-600">{breakdown}</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Actual Hourly Rate</p>
               <p className="text-4xl font-black text-indigo-600 tracking-tighter">{formatCurrency(currentActualRate)}<span className="text-base font-bold ml-1">/hr</span></p>
             </div>
          </div>

          <button type="submit" className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2">
            <Save size={24} /> {editingId ? 'UPDATE LOG' : 'SAVE LOG ENTRY'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-8 py-7">Date</th>
              <th className="px-8 py-7">Times</th>
              <th className="px-8 py-7">Hours</th>
              <th className="px-8 py-7">Actual Rate</th>
              <th className="px-8 py-7">Total Earned</th>
              <th className="px-8 py-7 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-24 text-center text-slate-300">
                  <div className="flex flex-col items-center">
                    <Clock className="w-20 h-20 mb-6 opacity-10" />
                    <p className="font-black text-lg">No entries logged yet</p>
                    <p className="text-sm font-medium mt-1">Your work history will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const dayStr = format(parseLocalISO(entry.date), 'EEE, MMM d');
                const [dayLabel, dateLabel] = dayStr.split(', ');
                const totalMultiplier = entry.hourlyRateAtTime / settings.basePayRate;

                return (
                  <tr key={entry.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-8 py-7">
                      <p className="text-xl font-black text-slate-900 leading-none mb-1">{dayLabel},</p>
                      <p className="text-xl font-black text-slate-900 leading-none">{dateLabel}</p>
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-slate-700 font-bold text-lg leading-tight">{entry.startTime} –</p>
                      <p className="text-slate-700 font-bold text-lg leading-tight">{entry.endTime}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase mt-1.5 tracking-wider">Break: {entry.breakMinutes}m</p>
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-2xl font-black text-slate-800 tracking-tighter">
                        {Math.floor(entry.workedHours)}h {Math.round((entry.workedHours % 1) * 60)}m
                      </p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase mt-1 ${
                        entry.type === WorkType.PUBLIC_HOLIDAY ? 'bg-amber-100 text-amber-700' : 
                        entry.type === WorkType.NORMAL ? 'bg-slate-100 text-slate-500' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="px-8 py-7">
                      <div className="flex flex-col">
                        <p className="text-xl font-black text-slate-900 leading-none mb-1">
                          {formatCurrency(entry.hourlyRateAtTime)}
                          <span className="text-sm font-bold text-slate-400">/hr</span>
                        </p>
                        <p className="text-[11px] font-medium text-slate-400">
                          Base: {formatCurrency(settings.basePayRate)} × {totalMultiplier.toFixed(2)}
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-7">
                      <p className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(entry.totalEarned)}</p>
                    </td>
                    <td className="px-8 py-7 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(entry)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Edit Log">
                          <Edit3 size={20} />
                        </button>
                        <button onClick={() => startCopySession(entry)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all" title="Copy to other days">
                          <Copy size={20} />
                        </button>
                        <button onClick={() => deleteEntry(entry.id)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all" title="Delete Log">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetTab;
