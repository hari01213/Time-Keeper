
import React, { useState, useMemo } from 'react';
import { 
  CreditCard, Plus, Trash2, Calendar as CalendarIcon, 
  ReceiptText, DollarSign, TrendingUp, TrendingDown, 
  Info, ArrowRight, Download, FileText, Landmark,
  Clock
} from 'lucide-react';
import { format, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
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
  
  // Logic for draft payslip (current month or since last pay)
  const latestPayRecord = payRecords[0];
  const draftStartDate = latestPayRecord ? parseLocalISO(latestPayRecord.endDate) : startOfMonth(new Date());
  const draftEndDate = new Date();

  const entriesInDraft = useMemo(() => {
    return entries.filter(e => {
      const entryDate = parseLocalISO(e.date);
      if (!latestPayRecord) return true; // Show all if no pay records
      return entryDate > parseLocalISO(latestPayRecord.endDate);
    });
  }, [entries, latestPayRecord]);

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
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payroll</h2>
          <p className="text-slate-500 text-sm font-medium">Financial earnings & Time In Lieu reports</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
        >
          {showForm ? 'Cancel' : <><Plus size={20} /> Record Pay</>}
        </button>
      </div>

      {/* TIL Report Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`col-span-1 md:col-span-2 p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between ${
          currentTIL >= 0 ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'
        }`}>
          <div>
            <div className="flex items-center gap-2 opacity-80 mb-2">
              <Clock size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Time In Lieu Report</span>
            </div>
            <h3 className="text-5xl font-black tracking-tighter mb-4">
              {currentTIL >= 0 ? '+' : ''}{currentTIL.toFixed(1)} <span className="text-2xl opacity-70">hrs</span>
            </h3>
            <p className="text-sm font-medium opacity-90 max-w-md">
              {currentTIL >= 0 
                ? `Great job! You have banked ${currentTIL.toFixed(1)} surplus hours. This represents roughly ${formatCurrency(currentTIL * settings.basePayRate)} in future earnings.`
                : `You are currently ${Math.abs(currentTIL).toFixed(1)} hours behind your paid cycles. You'll need to work more to catch up.`}
            </p>
          </div>
          <div className="flex gap-4 mt-8">
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <p className="text-[10px] font-black uppercase opacity-60">Total Worked</p>
              <p className="font-bold">{entries.reduce((s,e)=>s+e.workedHours,0).toFixed(1)}h</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
              <p className="text-[10px] font-black uppercase opacity-60">Total Paid</p>
              <p className="font-bold">{payRecords.reduce((s,p)=>s+p.hoursPaid,0).toFixed(1)}h</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-4">
              <TrendingUp size={24} />
              <span className="text-xs font-black uppercase tracking-widest">Growth</span>
            </div>
            <p className="text-sm text-slate-500 font-medium mb-1">Estimated Net Earnings</p>
            <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(netDraft)}</h4>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">Tax (Draft)</span>
                <span className="text-rose-500 font-bold">-{formatCurrency(taxDraft)}</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: grossDraft > 0 ? `${(netDraft/grossDraft)*100}%` : '0%' }}></div>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 flex items-center justify-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest hover:text-indigo-700">
             View Analytics <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSavePay} className="bg-white p-8 rounded-3xl shadow-2xl border-2 border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-black text-xl text-indigo-900 mb-6 flex items-center gap-2">
            <Landmark size={20}/> Log Real Payment Received
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period Start</label>
              <input type="date" value={formData.startDate} onChange={(e) => setFormData(p => ({...p, startDate: e.target.value}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period End</label>
              <input type="date" value={formData.endDate} onChange={(e) => setFormData(p => ({...p, endDate: e.target.value}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exact Hours Paid</label>
              <input type="number" step="0.01" value={formData.hoursPaid} onChange={(e) => setFormData(p => ({...p, hoursPaid: parseFloat(e.target.value) || 0}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none font-bold" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
              <input type="text" placeholder="e.g. Fortnightly Pay" value={formData.notes || ''} onChange={(e) => setFormData(p => ({...p, notes: e.target.value}))} className="w-full border-2 border-slate-100 rounded-xl px-4 py-3 bg-slate-50 focus:ring-4 focus:ring-indigo-100 outline-none" />
            </div>
          </div>
          <button type="submit" className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            CONFIRM PAY RECORD
          </button>
        </form>
      )}

      {/* Payslip View */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-100">
                <ReceiptText size={28} />
             </div>
             <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">Draft Payslip</h4>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Unpaid Cycle</p>
             </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Estimated Net Pay</p>
            <p className="text-3xl font-black text-indigo-600 tracking-tighter">{formatCurrency(netDraft)}</p>
          </div>
        </div>

        <div className="p-8">
           <table className="w-full text-left">
              <thead className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                <tr>
                  <th className="py-4">Earnings Category</th>
                  <th className="py-4">Hours</th>
                  <th className="py-4 text-right">Rate</th>
                  <th className="py-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entriesInDraft.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <p className="font-bold">No unpaid entries found.</p>
                      <p className="text-xs mt-1">Log some work in the Timesheet to see estimates.</p>
                    </td>
                  </tr>
                ) : (
                  entriesInDraft.map(e => (
                    <tr key={e.id} className="group">
                      <td className="py-4">
                        <p className="font-bold text-slate-800">{format(parseLocalISO(e.date), 'EEE, MMM d')}</p>
                        <p className="text-[10px] font-black uppercase text-indigo-400">{e.type}</p>
                      </td>
                      <td className="py-4 font-medium text-slate-600">{e.workedHours.toFixed(2)}h</td>
                      <td className="py-4 text-right font-medium text-slate-500">{formatCurrency(e.hourlyRateAtTime)}</td>
                      <td className="py-4 text-right font-black text-slate-800">{formatCurrency(e.totalEarned)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="border-t-2 border-slate-100">
                <tr>
                  <td colSpan={3} className="py-4 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Gross Total</td>
                  <td className="py-4 text-right font-black text-slate-900">{formatCurrency(grossDraft)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Tax Withheld (Est)</td>
                  <td className="py-2 text-right font-black text-rose-500">-{formatCurrency(taxDraft)}</td>
                </tr>
                <tr className="bg-indigo-50/50">
                  <td colSpan={3} className="py-5 text-right text-sm font-black text-indigo-900 uppercase tracking-widest pr-4">Estimated Take-Home Pay</td>
                  <td className="py-5 text-right font-black text-2xl text-indigo-600 px-4">{formatCurrency(netDraft)}</td>
                </tr>
              </tfoot>
           </table>
        </div>
      </div>

      {/* Pay History Ledger */}
      <div>
        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Historical Pay Records</h5>
        <div className="grid grid-cols-1 gap-4">
          {payRecords.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-dashed border-slate-200 text-center">
              <CreditCard className="mx-auto text-slate-200 mb-4" size={48} />
              <p className="text-slate-400 font-bold">No payment history yet.</p>
            </div>
          ) : (
            payRecords.map((record) => (
              <div key={record.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:border-indigo-100 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-2xl transition-colors">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{record.hoursPaid.toFixed(2)} hrs <span className="text-xs text-slate-400">Paid</span></h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {format(parseLocalISO(record.startDate), 'MMM d')} – {format(parseLocalISO(record.endDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  {record.notes && <span className="hidden sm:block text-[9px] font-black uppercase bg-slate-100 text-slate-400 px-3 py-1 rounded-full">{record.notes}</span>}
                  <button 
                    onClick={() => setPayRecords(p => p.filter(r => r.id !== record.id))}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={20} />
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
