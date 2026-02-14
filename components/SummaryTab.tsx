
import React from 'react';
import { TrendingUp, TrendingDown, Info, Calendar as CalendarIcon, DollarSign, ReceiptText } from 'lucide-react';
import { format, isWithinInterval } from 'date-fns';
import { TimesheetEntry, PayRecord, Settings, EmploymentType } from '../types';
import { formatDecimalHours, parseLocalISO, formatCurrency, calculateTax } from '../utils/helpers';

interface Props {
  entries: TimesheetEntry[];
  payRecords: PayRecord[];
  settings: Settings;
  currentTIL: number;
}

const SummaryTab: React.FC<Props> = ({ entries, payRecords, settings, currentTIL }) => {
  const latestPay = payRecords[0];
  
  const entriesInLatestPeriod = latestPay ? entries.filter(e => 
    isWithinInterval(parseLocalISO(e.date), {
      start: parseLocalISO(latestPay.startDate),
      end: parseLocalISO(latestPay.endDate)
    })
  ) : [];

  const grossPay = entriesInLatestPeriod.reduce((sum, e) => sum + e.totalEarned, 0);
  const totalHoursWorked = entriesInLatestPeriod.reduce((sum, e) => sum + e.workedHours, 0);
  const tax = calculateTax(grossPay);
  const netPay = grossPay - tax;

  return (
    <div className="space-y-8 pb-12">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-slate-500 text-sm font-medium">Estimated Net Pay (Current Period)</p>
              <h3 className="text-4xl font-black text-slate-900 mt-1">
                {formatCurrency(netPay)}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Based on {totalHoursWorked.toFixed(1)} hours logged
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign size={28} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Gross</p>
              <p className="text-sm font-bold text-slate-700">{formatCurrency(grossPay)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Tax (Est)</p>
              <p className="text-sm font-bold text-rose-500">-{formatCurrency(tax)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">TIL Balance</p>
              <p className={`text-sm font-bold ${currentTIL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {currentTIL.toFixed(1)}h
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Emp Type</p>
              <p className="text-sm font-bold text-indigo-600">{settings.employmentType}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="flex items-center gap-2 mb-4 opacity-80">
            <Info size={16} />
            <p className="text-xs font-bold uppercase">TIL Status</p>
          </div>
          <p className="text-sm leading-relaxed mb-4">
            {currentTIL >= 0 
              ? `You've banked ${currentTIL.toFixed(1)} hours of TIL. That's worth approximately ${formatCurrency(currentTIL * settings.basePayRate)}!`
              : `You are behind by ${Math.abs(currentTIL).toFixed(1)} hours based on your paid cycles.`
            }
          </p>
          <div className="flex items-center gap-2 mt-auto">
             <div className={`p-2 rounded-lg bg-white/20`}>
                {currentTIL >= 0 ? <TrendingUp size={20}/> : <TrendingDown size={20}/>}
             </div>
             <span className="text-xs font-bold uppercase tracking-widest">
                {currentTIL >= 0 ? 'Surplus' : 'Deficit'}
             </span>
          </div>
        </div>
      </div>

      {/* Payslip Report */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <ReceiptText className="text-indigo-600" />
             <h4 className="font-bold text-slate-800 uppercase tracking-tight">Period Earnings Report</h4>
          </div>
          {latestPay && (
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400">CURRENT PERIOD</p>
              <p className="text-xs font-medium text-slate-600">{format(parseLocalISO(latestPay.startDate), 'MMM d')} - {format(parseLocalISO(latestPay.endDate), 'MMM d, yyyy')}</p>
            </div>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Hours</th>
                <th className="px-6 py-4">Base Rate</th>
                <th className="px-6 py-4">Actual Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entriesInLatestPeriod.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                    No entries recorded for this pay period.
                  </td>
                </tr>
              ) : (
                entriesInLatestPeriod.map((e) => (
                  <tr key={e.id} className="text-sm">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-700">{format(parseLocalISO(e.date), 'EEE, MMM d')}</p>
                      <p className="text-[10px] text-slate-400">{e.type}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{e.workedHours.toFixed(2)}h</td>
                    <td className="px-6 py-4 text-slate-500">{formatCurrency(settings.basePayRate)}</td>
                    <td className="px-6 py-4">
                       <span className="font-medium text-indigo-600">{formatCurrency(e.hourlyRateAtTime)}</span>
                       {e.hourlyRateAtTime > settings.basePayRate && (
                         <span className="ml-1 text-[9px] font-black text-orange-500">{(e.hourlyRateAtTime/settings.basePayRate).toFixed(2)}x</span>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{formatCurrency(e.totalEarned)}</td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 border-t">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Gross Period Total</td>
                <td className="px-6 py-3 text-right font-black text-lg text-slate-900">{formatCurrency(grossPay)}</td>
              </tr>
              <tr className="border-t">
                <td colSpan={4} className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase">Estimated Tax (AU Foreign Res)</td>
                <td className="px-6 py-3 text-right font-bold text-rose-500">-{formatCurrency(tax)}</td>
              </tr>
              <tr className="border-t bg-indigo-50/50">
                <td colSpan={4} className="px-6 py-4 text-right text-xs font-black text-indigo-900 uppercase">Net Take-Home Pay</td>
                <td className="px-6 py-4 text-right font-black text-xl text-indigo-700">{formatCurrency(netPay)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
