
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus,
  Clock,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { TimesheetEntry, PayRecord, Settings, TabType, WorkType } from './types';
import TimesheetTab from './components/TimesheetTab';
import PayEntryTab from './components/PayEntryTab';
import SummaryTab from './components/SummaryTab';
import SettingsTab from './components/SettingsTab';

const DEFAULT_SETTINGS: Settings = {
  standardDailyHours: 7.5,
  defaultBreak: 30,
  publicHolidayHours: 7.5,
  fortnightAnchorDate: '2024-01-01',
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('timesheet');
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [payRecords, setPayRecords] = useState<PayRecord[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence
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
        return <TimesheetTab 
          entries={entries} 
          setEntries={setEntries} 
          settings={settings} 
        />;
      case 'pay':
        return <PayEntryTab 
          payRecords={payRecords} 
          setPayRecords={setPayRecords} 
          settings={settings}
        />;
      case 'summary':
        return <SummaryTab 
          entries={entries} 
          payRecords={payRecords} 
          settings={settings}
          currentTIL={currentTIL}
        />;
      case 'settings':
        return <SettingsTab 
          settings={settings} 
          setSettings={setSettings} 
        />;
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0 md:pl-20 bg-slate-50 flex flex-col">
      {/* Mobile Top Stats */}
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-20 md:hidden">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-xl text-slate-800">TIL Tracker</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            currentTIL > 0 ? 'bg-emerald-100 text-emerald-700' : 
            currentTIL < 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {currentTIL > 0 ? '+' : ''}{currentTIL.toFixed(2)}h TIL
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8">
        {renderTab()}
      </main>

      {/* Bottom Nav / Sidebar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex md:flex-col md:w-20 md:h-full md:border-t-0 md:border-r md:top-0 z-30">
        <div className="hidden md:flex flex-col items-center py-6 border-b border-slate-100 mb-4">
          <Clock className="w-8 h-8 text-indigo-600" />
        </div>
        
        <NavItem 
          active={activeTab === 'timesheet'} 
          onClick={() => setActiveTab('timesheet')} 
          icon={<Calendar className="w-6 h-6" />} 
          label="Entries" 
        />
        <NavItem 
          active={activeTab === 'pay'} 
          onClick={() => setActiveTab('pay')} 
          icon={<CreditCard className="w-6 h-6" />} 
          label="Payroll" 
        />
        <NavItem 
          active={activeTab === 'summary'} 
          onClick={() => setActiveTab('summary')} 
          icon={<BarChart3 className="w-6 h-6" />} 
          label="Summary" 
        />
        <NavItem 
          active={activeTab === 'settings'} 
          onClick={() => setActiveTab('settings')} 
          icon={<SettingsIcon className="w-6 h-6" />} 
          label="Settings" 
        />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-3 transition-colors ${
      active ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-[10px] mt-1 font-medium">{label}</span>
    {active && <div className="hidden md:block absolute right-0 w-1 h-8 bg-indigo-600 rounded-l-full" />}
  </button>
);

export default App;
