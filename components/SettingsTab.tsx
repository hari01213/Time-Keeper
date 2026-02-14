
import React, { useRef } from 'react';
import { Save, Shield, RotateCcw, Download, Upload, FileJson, Users, Banknote, Clock, Coffee } from 'lucide-react';
import { Settings, EmploymentType } from '../types';

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsTab: React.FC<Props> = ({ settings, setSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    if (confirm('DANGER: This will delete ALL your logs and settings. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Configurations</h2>
        <p className="text-slate-500 text-sm">Customize pay rates, tax logic, and employment rules</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm divide-y">
        {/* Employment Type */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={16} className="text-indigo-500" /> Employment Profile
          </h3>
          <div className="grid grid-cols-2 gap-4">
             {Object.values(EmploymentType).map(type => (
               <button
                key={type}
                onClick={() => handleChange('employmentType', type)}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${
                  settings.employmentType === type 
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                }`}
               >
                 {type}
               </button>
             ))}
          </div>
          
          {settings.employmentType === EmploymentType.CASUAL && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-indigo-700 uppercase">Casual Loading Multiplier</p>
                <input 
                  type="number" step="0.01"
                  value={settings.casualLoadingMultiplier}
                  onChange={(e) => handleChange('casualLoadingMultiplier', parseFloat(e.target.value) || 1)}
                  className="w-16 border rounded bg-white px-2 py-1 text-right text-xs font-bold"
                />
              </div>
              <p className="text-[10px] text-indigo-500 italic">Standard casual loading in Australia is 1.25 (25% extra).</p>
            </div>
          )}
        </div>

        {/* Working Rules */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> Working Rules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Coffee size={14} className="text-slate-400" />
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Default Break (Mins)</label>
              </div>
              <input 
                type="number" 
                value={settings.defaultBreak}
                onChange={(e) => handleChange('defaultBreak', parseInt(e.target.value) || 0)}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 bg-slate-50 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400">Applied automatically to new timesheet entries.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Standard Day (Hours)</label>
              </div>
              <input 
                type="number" 
                step="0.1"
                value={settings.standardDailyHours}
                onChange={(e) => handleChange('standardDailyHours', parseFloat(e.target.value) || 0)}
                className="w-full border-2 border-slate-100 rounded-xl px-4 py-2.5 bg-slate-50 font-bold focus:ring-4 focus:ring-blue-50 outline-none transition-all"
              />
              <p className="text-[10px] text-slate-400">Used for calculating TIL "days available" estimates.</p>
            </div>
          </div>
        </div>

        {/* Pay Rates */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Banknote size={16} className="text-emerald-500" /> Pay & Multipliers
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Base Hourly Rate</p>
                <p className="text-xs text-slate-400">Regular weekday rate (before any loading)</p>
              </div>
              <input 
                type="number" 
                step="0.01"
                value={settings.basePayRate}
                onChange={(e) => handleChange('basePayRate', parseFloat(e.target.value) || 0)}
                className="w-24 border rounded-lg px-3 py-2 bg-slate-50 text-right font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Saturday Mult.</label>
                 <input 
                  type="number" step="0.05"
                  value={settings.multiplierSaturday}
                  onChange={(e) => handleChange('multiplierSaturday', parseFloat(e.target.value) || 1)}
                  className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Sunday Mult.</label>
                 <input 
                  type="number" step="0.05"
                  value={settings.multiplierSunday}
                  onChange={(e) => handleChange('multiplierSunday', parseFloat(e.target.value) || 1)}
                  className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase">Public Hol. Mult.</label>
                 <input 
                  type="number" step="0.05"
                  value={settings.multiplierPublicHoliday}
                  onChange={(e) => handleChange('multiplierPublicHoliday', parseFloat(e.target.value) || 1)}
                  className="w-full border rounded-lg px-3 py-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500"
                 />
               </div>
            </div>
          </div>
        </div>

        {/* Data Portability */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileJson size={16} className="text-blue-500" /> Data Management
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                const data = {
                  entries: JSON.parse(localStorage.getItem('til_entries') || '[]'),
                  payRecords: JSON.parse(localStorage.getItem('til_pay') || '[]'),
                  settings: settings
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `til-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 px-4 py-3 rounded-lg text-sm font-bold transition-colors"
            >
              <Download size={16} /> Export
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 px-4 py-3 rounded-lg text-sm font-bold transition-colors"
            >
              <Upload size={16} /> Import
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".json" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (re) => {
                  try {
                    const json = JSON.parse(re.target?.result as string);
                    if (confirm('Overwrite existing data?')) {
                      localStorage.setItem('til_entries', JSON.stringify(json.entries));
                      localStorage.setItem('til_pay', JSON.stringify(json.payRecords));
                      localStorage.setItem('til_settings', JSON.stringify(json.settings));
                      window.location.reload();
                    }
                  } catch (err) { alert('Invalid file'); }
                };
                reader.readAsText(file);
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
        <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2 mb-2">
          <RotateCcw size={16} /> Reset Everything
        </h3>
        <p className="text-sm text-rose-600 mb-4">Clears all timesheets, pay records, and custom settings.</p>
        <button onClick={resetAll} className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 rounded-lg font-bold">Wipe Data</button>
      </div>
    </div>
  );
};

export default SettingsTab;
