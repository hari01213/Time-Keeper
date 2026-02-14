
import React, { useRef } from 'react';
import { Save, Shield, HelpCircle, RotateCcw, Download, Upload, FileJson } from 'lucide-react';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
}

const SettingsTab: React.FC<Props> = ({ settings, setSettings }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (key: keyof Settings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    if (confirm('DANGER: This will delete ALL your logs and settings. Proceed?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const exportData = () => {
    const data = {
      entries: JSON.parse(localStorage.getItem('til_entries') || '[]'),
      payRecords: JSON.parse(localStorage.getItem('til_pay') || '[]'),
      settings: settings
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `til-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (confirm('This will overwrite your current data with the imported file. Continue?')) {
          localStorage.setItem('til_entries', JSON.stringify(json.entries || []));
          localStorage.setItem('til_pay', JSON.stringify(json.payRecords || []));
          localStorage.setItem('til_settings', JSON.stringify(json.settings || settings));
          window.location.reload();
        }
      } catch (err) {
        alert('Invalid backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 text-sm">Configure your work defaults and tracking logic</p>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm divide-y">
        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield size={16} className="text-indigo-500" /> General Defaults
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Standard Daily Hours</p>
                <p className="text-xs text-slate-400">Hours in a typical work day</p>
              </div>
              <input 
                type="number" 
                step="0.1"
                value={settings.standardDailyHours}
                onChange={(e) => handleChange('standardDailyHours', parseFloat(e.target.value) || 0)}
                className="w-20 border rounded-lg px-2 py-1 bg-slate-50 text-right focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Default Break</p>
                <p className="text-xs text-slate-400">Minutes deducted from daily work</p>
              </div>
              <input 
                type="number" 
                value={settings.defaultBreak}
                onChange={(e) => handleChange('defaultBreak', parseInt(e.target.value) || 0)}
                className="w-20 border rounded-lg px-2 py-1 bg-slate-50 text-right focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Save size={16} className="text-amber-500" /> Holiday Logic
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-700">Public Holiday Credits</p>
                <p className="text-xs text-slate-400">Hours automatically added for holidays</p>
              </div>
              <input 
                type="number" 
                step="0.1"
                value={settings.publicHolidayHours}
                onChange={(e) => handleChange('publicHolidayHours', parseFloat(e.target.value) || 0)}
                className="w-20 border rounded-lg px-2 py-1 bg-slate-50 text-right focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileJson size={16} className="text-blue-500" /> Data Portability
          </h3>
          <div className="flex gap-4">
            <button 
              onClick={exportData}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Download size={16} /> Export JSON
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} /> Import Backup
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={importData} 
              className="hidden" 
              accept=".json"
            />
          </div>
        </div>
      </div>

      <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 space-y-4">
        <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
          <RotateCcw size={16} /> Danger Zone
        </h3>
        <p className="text-sm text-rose-600">
          Resetting the app will remove all your hard work! Make sure you don't need the data anymore.
        </p>
        <button 
          onClick={resetAll}
          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          Reset All Data
        </button>
      </div>

      <div className="text-center pb-12">
        <p className="text-xs text-slate-400">TIL Tracker Pro v1.1.0</p>
        <p className="text-xs text-slate-300 mt-1">Your data is stored locally in your browser.</p>
      </div>
    </div>
  );
};

export default SettingsTab;
