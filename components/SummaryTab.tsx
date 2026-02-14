
import React from 'react';
// Added BarChart3 to the imports
import { TrendingUp, TrendingDown, Info, Calendar as CalendarIcon, DollarSign, Clock, ArrowUpRight, BarChart3 } from 'lucide-react';
import { TimesheetEntry, PayRecord, Settings } from '../types';
import { formatDecimalHours, formatCurrency } from '../utils/helpers';

interface Props {
  entries: TimesheetEntry[];
  payRecords: PayRecord[];
  settings: Settings;
  currentTIL: number;
}

const SummaryTab: React.FC<Props> = ({ entries, payRecords, settings, currentTIL }) => {
  const totalWorkedHrs = entries.reduce((s, e) => s + e.workedHours, 0);
  const totalPaidHrs = payRecords.reduce((s, p) => s + p.hoursPaid, 0);

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Balance Card */}
        <div className="flex-1 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="flex justify-between items-start mb-10">
            <div>
              <p className="text-slate-500 font-semibold text-sm tracking-tight mb-2">Time In Lieu Balance</p>
              <h2 className={`text-6xl font-black tracking-tighter flex items-baseline gap-3 ${currentTIL >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {currentTIL >= 0 ? '+' : ''}{currentTIL.toFixed(2)}
                <span className="text-2xl font-black uppercase text-slate-900 tracking-widest">Hours</span>
              </h2>
            </div>
            <div className={`p-4 rounded-2xl ${currentTIL >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
              {currentTIL >= 0 ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Worked</p>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{formatDecimalHours(totalWorkedHrs)}</p>
            </div>
            <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-slate-800 tracking-tight">{formatDecimalHours(totalPaidHrs)}</p>
            </div>
          </div>
        </div>

        {/* Quick Tip Card */}
        <div className="w-full md:w-[380px] bg-indigo-600 p-10 rounded-[2.5rem] shadow-xl text-white relative flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 text-white/70">
              <Info size={18} />
              <p className="text-[11px] font-black uppercase tracking-widest">Quick Tip</p>
            </div>
            <p className="text-lg font-medium leading-snug mb-8">
              {currentTIL >= 0 
                ? `You have extra hours compared to your pay checks. That's almost ${Math.max(0, (currentTIL / settings.standardDailyHours)).toFixed(1)} full days of leave available!`
                : `You've been paid for more hours than you've logged. You are currently ${Math.abs(currentTIL).toFixed(1)} hours in deficit.`
              }
            </p>
          </div>
          
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
             <div 
              className="h-full bg-white transition-all duration-1000" 
              style={{ width: currentTIL > 0 ? `${Math.min(100, (currentTIL/40)*100)}%` : '0%' }}
             />
          </div>
        </div>
      </div>

      {/* Placeholder for future detailed comparison */}
      <div className="pt-4">
        <div className="flex items-center gap-3 mb-8">
          <CalendarIcon size={24} className="text-slate-400" />
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Period Comparison</h3>
        </div>
        
        <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-slate-300">
           <BarChart3 size={48} className="mb-4 opacity-20" />
           <p className="font-bold">Comparative data will appear here as you log more periods</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
