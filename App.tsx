
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Wallet, 
  Settings as SettingsIcon, 
  Clock
} from 'lucide-react';
import { TimesheetEntry, PayRecord, Settings, TabType, EmploymentType } from './types';
import TimesheetTab from './components/TimesheetTab';
import PayrollTab from './components/PayrollTab';
import SettingsTab from './components/SettingsTab';

const DEFAULT_SETTINGS: Settings = {
  employmentType: EmploymentType.REGULAR,
  standardDailyHours: 7.5,
  defaultBreak: 30,
  basePayRate: 30,
  casualLoadingMultiplier: 1.25,
  multiplierSaturday: 1.5,
  multiplierSunday: 2.0,
  multiplierPublicHoliday: 2.5,
  publicHolidayHours: 7.5,
  fortnightAnchorDate: '2024-01-01',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('timesheet');
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [payRecords, setPayRecords] = useState<PayRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedEntries = localStorage.getItem('til_entries');
    const savedPay = localStorage.getItem('til_pay');
    const savedSettings = localStorage.getItem('til_settings');

    if (savedEntries) setEntries(JSON.parse(savedEntries));
    if (savedPay) setPayRecords(JSON.parse(savedPay));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('til_entries', JSON.stringify(entries));
      localStorage.setItem('til_pay', JSON.stringify(payRecords));
      localStorage.setItem('til_settings', JSON.stringify(settings));
    }
  }, [entries, payRecords, settings, isLoaded]);

  const totalWorked = useMemo(() => 
    entries.reduce((sum, e) => sum + e.workedHours, 0), [entries]);

  const totalPaid = useMemo(() => 
    payRecords.reduce((sum, p) => sum + p.hoursPaid, 0), [payRecords]);

  const currentTIL = totalWorked - totalPaid;

  const renderTab = () => {
    switch (activeTab) {
      case 'timesheet':
        return <TimesheetTab entries={entries} setEntries={setEntries} settings={settings} />;
      case 'payroll':
        return <PayrollTab entries={entries} payRecords={payRecords} setPayRecords={setPayRecords} settings={settings} currentTIL={currentTIL} />;
      case 'settings':
        return <SettingsTab settings={settings} setSettings={setSettings} />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-20 md:hidden flex justify-between items-center">
        <h1 className="font-black text-xl text-indigo-900 tracking-tight">TIL PRO</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
          currentTIL >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
        }`}>
          {currentTIL >= 0 ? '+' : ''}{currentTIL.toFixed(1)}h
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-10">
        {renderTab()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex md:flex-col md:w-20 md:h-full md:border-t-0 md:border-r md:top-0 z-30 shadow-2xl md:shadow-none">
        <div className="hidden md:flex flex-col items-center py-8 border-b border-slate-50 mb-4">
          <Clock className="w-8 h-8 text-indigo-600" />
        </div>
        <NavItem active={activeTab === 'timesheet'} onClick={() => setActiveTab('timesheet')} icon={<Calendar size={24} />} label="Logs" />
        <NavItem active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} icon={<Wallet size={24} />} label="Payroll" />
        <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={24} />} label="Config" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-4 transition-all relative ${
    active ? 'text-indigo-600 bg-indigo-50/30' : 'text-slate-400 hover:text-indigo-400'
  }`}>
    {icon}
    <span className="text-[10px] mt-1 font-bold uppercase tracking-widest">{label}</span>
    {active && <div className="hidden md:block absolute right-0 w-1 h-12 bg-indigo-600 rounded-l-full" />}
    {active && <div className="md:hidden absolute top-0 w-full h-1 bg-indigo-600" />}
  </button>
);

export default App;
