
import React, { useState } from 'react';
import { CreditCard, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { PayRecord, Settings } from '../types';
import { parseLocalISO } from '../utils/helpers';

interface Props {
  payRecords: PayRecord[];
  setPayRecords: React.Dispatch<React.SetStateAction<PayRecord[]>>;
  settings: Settings;
}

const PayEntryTab: React.FC<Props> = ({ payRecords, setPayRecords, settings }) => {
  const [showForm, setShowForm] = useState(false);
  
  const getToday = () => new Date();
  const getFortnightAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d;
  };

  const [formData, setFormData] = useState<Partial<PayRecord>>({
    startDate: format(getFortnightAgo(), 'yyyy-MM-dd'),
    endDate: format(getToday(), 'yyyy-MM-dd'),
    hoursPaid: settings.standardDailyHours * 10,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PayRecord = {
      id: crypto.randomUUID(),
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      hoursPaid: formData.hoursPaid!,
      notes: formData.notes
    };

    setPayRecords(prev => [newRecord, ...prev].sort((a, b) => b.startDate.localeCompare(a.startDate)));
    setShowForm(false);
  };

  const deleteRecord = (id: string) => {
    if (confirm('Delete this pay record?')) {
      setPayRecords(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pay Records</h2>
          <p className="text-slate-500 text-sm">Log hours you've been paid for</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
        >
          {showForm ? 'Cancel' : <><Plus size={18} /> Add Pay Record</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Period Start</label>
              <input 
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Period End</label>
              <input 
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(p => ({...p, endDate: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Hours Paid</label>
              <input 
                type="number"
                step="0.01"
                value={formData.hoursPaid}
                onChange={(e) => setFormData(p => ({...p, hoursPaid: parseFloat(e.target.value) || 0}))}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Notes (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. Fortnight 4 Bonus"
                value={formData.notes || ''}
                onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition-colors">
            Save Pay Record
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {payRecords.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No pay records found. Enter a payment to start tracking TIL.</p>
          </div>
        ) : (
          payRecords.map((record) => (
            <div key={record.id} className="bg-white p-5 rounded-xl border shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                  <CreditCard size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800">{record.hoursPaid.toFixed(2)} hrs Paid</h3>
                    {record.notes && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{record.notes}</span>}
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <CalendarIcon size={12} />
                    {format(parseLocalISO(record.startDate), 'MMM d')} - {format(parseLocalISO(record.endDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => deleteRecord(record.id)}
                className="text-slate-300 hover:text-rose-500 transition-colors p-2"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PayEntryTab;
