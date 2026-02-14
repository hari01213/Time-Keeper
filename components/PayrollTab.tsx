
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Plus, Trash2, Calendar as CalendarIcon, 
  ReceiptText, DollarSign, TrendingUp, TrendingDown, 
  Info, ArrowRight, Download, FileText, Landmark,
  Clock, ShieldCheck, Calendar
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth, isSameMonth } from 'date-fns';
import { TimesheetEntry, PayRecord, Settings, EmploymentType } from '../types';
import { parseLocalISO, formatCurrency, calculateTax } from '../utils/helpers';

interface Props {
  entries: TimesheetEntry[];
  payRecords: PayRecord[];
  setPayRecords: React.Dispatch<React.SetStateAction<PayRecord[]>>;
  settings: Settings;
  currentTIL: number;
}

const PayrollTab: React.FC<Props> = ({ entries, payRecords, setPayRecords, settings, currentTIL }) => {
  const [showForm, setShowForm] = useState(false);
  
  // Logic for draft payslip: Shows all entries for the current month
  // Disconnected from pay records as requested
  const entriesInDraft = useMemo(() => {
    const now = new Date();
    return entries.filter(e => {
      const entryDate = parseLocalISO(e.date);
      return isSameMonth(entryDate, now);
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [entries]);

  const grossDraft = entriesInDraft.reduce((sum, e) => sum + e.totalEarned, 0);
  const hoursDraft = entriesInDraft.reduce((sum, e) => sum + e.workedHours, 0);
  const taxDraft = calculateTax(grossDraft);
  const netDraft = grossDraft - taxDraft;

  const [formData, setFormData] = useState<Partial<PayRecord>>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    hoursPaid: 75,
  });

  const handleSavePay = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: PayRecord = {
      id: crypto.randomUUID(),
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      hoursPaid: formData.hoursPaid!,
      notes: formData.notes
    };
    setPayRecords(prev => [newRecord, ...prev].sort((a, b) => b.endDate.localeCompare(a.endDate)));
    setShowForm(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payroll</h2>
          <p className="text-slate-500 text-sm font-medium">Manage payslips and tax deductions</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          {showForm ? 'Cancel' : <><Plus size={20} /> Record Pay</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSavePay} className="bg-white p-8 rounded-[2rem] shadow-2xl border-2 border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-black text-xl text-indigo-900 mb-6 flex items-center gap-2">
            <Landmark size={20}/> Log Payment Confirmation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Start</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  value={formData.startDate} 
                  onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))} 
                  className="w-full border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none font-medium" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period End</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="date" 
                  value={formData.endDate} 
                  onChange={(e) => setFormData(p => ({...p, endDate: e.target.value}))} 
                  className="w-full border-2 border-slate-100 rounded-xl pl-12 pr-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none font-medium" 
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Hours on Payslip</label>
              <input type="number" step="0.01" value={formData.hoursPaid} onChange={(e) => setFormData(p => ({...p, hoursPaid: parseFloat(e.target.value) || 0}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none font-black text-lg" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reference / Notes</label>
              <input type="text" placeholder="e.g. November Fortnight" value={formData.notes || ''} onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            SAVE PAY RECORD
          </button>
        </form>
      )}

      {/* Payslip View */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-indigo-600 text-white rounded-[1.5rem] shadow-lg shadow-indigo-100">
                <ReceiptText size={28} />
             </div>
             <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">Draft Payslip</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{format(new Date(), 'MMMM yyyy')} Projection</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Take-Home Estimate</p>
            <p className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(netDraft)}</p>
          </div>
        </div>

        <div className="p-8">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                  <tr>
                    <th className="py-4">Source Entry</th>
                    <th className="py-4">Duration</th>
                    <th className="py-4 text-right">Calculated Rate</th>
                    <th className="py-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entriesInDraft.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-16 text-center text-slate-400">
                        <ShieldCheck className="mx-auto mb-3 opacity-10" size={40} />
                        <p className="font-bold">No entries logged for this month.</p>
                      </td>
                    </tr>
                  ) : (
                    entriesInDraft.map(e => (
                      <tr key={e.id} className="group">
                        <td className="py-5">
                          <p className="font-medium text-slate-800">{format(parseLocalISO(e.date), 'EEE, MMM d')}</p>
                          <p className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">{e.type}</p>
                        </td>
                        <td className="py-5 text-slate-600">{e.workedHours.toFixed(2)} hrs</td>
                        <td className="py-5 text-right text-slate-500">{formatCurrency(e.hourlyRateAtTime)}</td>
                        <td className="py-5 text-right font-medium text-slate-900">{formatCurrency(e.totalEarned)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t-2 border-slate-100">
                  <tr>
                    <td colSpan={3} className="py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Gross Projection</td>
                    <td className="py-4 text-right font-medium text-slate-900">{formatCurrency(grossDraft)}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest">Tax Withholding (Non-Res Est)</td>
                    <td className="py-2 text-right font-medium text-rose-500">-{formatCurrency(taxDraft)}</td>
                  </tr>
                  <tr className="bg-indigo-50/30">
                    <td colSpan={3} className="py-6 text-right text-sm font-black text-indigo-900 uppercase tracking-widest pr-4">Net Take-Home Pay</td>
                    <td className="py-6 text-right font-black text-3xl text-indigo-600 px-4 tracking-tighter">{formatCurrency(netDraft)}</td>
                  </tr>
                </tfoot>
             </table>
           </div>
        </div>
      </div>

      {/* Pay History Ledger */}
      <div>
        <div className="flex items-center gap-3 mb-6 ml-4">
           <FileText size={20} className="text-slate-400" />
           <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Historical Ledger (TIL Calculation Only)</h5>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {payRecords.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-16 border border-dashed border-slate-200 text-center flex flex-col items-center">
              <CreditCard className="text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">No payment history archived.</p>
            </div>
          ) : (
            payRecords.map((record) => (
              <div key={record.id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{record.hoursPaid.toFixed(2)} Hours Paid</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Period: {format(parseLocalISO(record.startDate), 'MMM d')} – {format(parseLocalISO(record.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {record.notes && <span className="hidden sm:block text-[10px] font-black uppercase bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full tracking-wider">{record.notes}</span>}
                  <button 
                    onClick={() => { if(confirm('Delete pay record?')) setPayRecords(p => p.filter(r => r.id !== record.id)); }}
                    className="p-3 text-slate-200 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollTab;
