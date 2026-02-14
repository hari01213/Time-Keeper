
import React from 'react';
import { TrendingUp, TrendingDown, Info, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { TimesheetEntry, PayRecord, Settings } from '../types';
import { formatDecimalHours } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Props {
  entries: TimesheetEntry[];
  payRecords: PayRecord[];
  settings: Settings;
  currentTIL: number;
}

const SummaryTab: React.FC<Props> = ({ entries, payRecords, settings, currentTIL }) => {
  
  // Helper for local-safe parsing of YYYY-MM-DD strings
  const parseLocalISO = (s: string) => {
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  // Group worked hours by pay periods
  const periodData = payRecords.slice(0, 6).reverse().map(pay => {
    const workedInPeriod = entries.filter(e => 
      isWithinInterval(parseLocalISO(e.date), {
        start: parseLocalISO(pay.startDate),
        end: parseLocalISO(pay.endDate)
      })
    ).reduce((sum, e) => sum + e.workedHours, 0);

    return {
      name: format(parseLocalISO(pay.startDate), 'MMM d'),
      worked: workedInPeriod,
      paid: pay.hoursPaid,
      til: workedInPeriod - pay.hoursPaid
    };
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">Time In Lieu Balance</p>
              <h3 className={`text-4xl font-black mt-1 ${
                currentTIL >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {currentTIL > 0 ? '+' : ''}{currentTIL.toFixed(2)} <span className="text-xl font-bold uppercase">Hours</span>
              </h3>
            </div>
            <div className={`p-3 rounded-xl ${
              currentTIL >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {currentTIL >= 0 ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex-1 bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Worked</p>
              <p className="text-lg font-bold text-slate-700">
                {formatDecimalHours(entries.reduce((s, e) => s + e.workedHours, 0))}
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Paid</p>
              <p className="text-lg font-bold text-slate-700">
                {formatDecimalHours(payRecords.reduce((s, p) => s + p.hoursPaid, 0))}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Info size={16} />
            <p className="text-xs font-bold uppercase">Quick Tip</p>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            You have {currentTIL > 0 ? 'extra' : 'fewer'} hours compared to your pay checks. 
            {currentTIL > 0 
              ? ` That's almost ${Math.floor(currentTIL / settings.standardDailyHours)} full days of leave available!` 
              : " Log your overtime or check if you missed a pay record entry."}
          </p>
          <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white" 
              style={{ width: `${Math.min(100, (currentTIL / (settings.standardDailyHours * 5)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Charts */}
      {periodData.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-slate-800">Recent Pay Cycles</h4>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-500 rounded-sm"></div> Worked</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded-sm"></div> Paid</div>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={periodData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="worked" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="paid" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Period Breakdown List */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon size={18} className="text-slate-400" />
          Period Comparison
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {payRecords.map((pay) => {
            const worked = entries.filter(e => 
              isWithinInterval(parseLocalISO(e.date), {
                start: parseLocalISO(pay.startDate),
                end: parseLocalISO(pay.endDate)
              })
            ).reduce((sum, e) => sum + e.workedHours, 0);
            const diff = worked - pay.hoursPaid;

            return (
              <div key={pay.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                    {format(parseLocalISO(pay.startDate), 'MMM d')} - {format(parseLocalISO(pay.endDate), 'MMM d, yyyy')}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-slate-600 text-sm">
                      <Clock size={14} /> {worked.toFixed(1)}w
                    </div>
                    <div className="text-slate-300">/</div>
                    <div className="text-slate-500 text-sm">{pay.hoursPaid.toFixed(1)}p</div>
                  </div>
                </div>
                <div className={`text-right ${diff > 0 ? 'text-emerald-600' : diff < 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                  <p className="text-lg font-bold">{diff > 0 ? '+' : ''}{diff.toFixed(1)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider">TIL Diff</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
