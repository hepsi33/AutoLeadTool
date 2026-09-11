import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Target, LayoutDashboard, FileSpreadsheet, Building2, ShieldAlert, Settings } from 'lucide-react';

import Header from './components/Header';
import LeadsTab from './components/LeadsTab';
import ExportsTab from './components/ExportsTab';
import ClientsTab from './components/ClientsTab';
import ExclusionsTab from './components/ExclusionsTab';
import SettingsTab from './components/SettingsTab';
import CompanySlidePanel from './components/CompanySlidePanel';
import ProgressDrawer from './components/ProgressDrawer';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'exports', label: 'Reports & Exports', icon: FileSpreadsheet },
  { id: 'clients', label: 'Client Database', icon: Building2 },
  { id: 'exclusions', label: 'Exclusions', icon: ShieldAlert },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [runStatus, setRunStatus] = useState(null);
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showProgressDrawer, setShowProgressDrawer] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [statsRes, leadsRes, statusRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/leads'),
        fetch('/api/research/status')
      ]);

      const statsData = await statsRes.json();
      const leadsData = await leadsRes.json();
      const statusData = await statusRes.json();

      setStats(statsData);
      setLeads(leadsData);
      setRunStatus(statusData);

      if (statusData.isSearching) {
        setShowProgressDrawer(true);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    let interval = null;
    if (runStatus?.isSearching) {
      interval = setInterval(async () => {
        try {
          const res = await fetch('/api/research/status');
          const data = await res.json();
          setRunStatus(data);
          if (!data.isSearching) {
            clearInterval(interval);
            loadDashboardData();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }
        } catch (err) {
          console.error('Polling status error:', err);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [runStatus?.isSearching]);

  const handleTriggerResearch = async () => {
    if (runStatus?.status === 'COMPLETED') {
      const confirmOverride = confirm("Today's research has already completed automatically. Do you want to run another research cycle?");
      if (!confirmOverride) return;
    }

    setShowProgressDrawer(true);
    try {
      await fetch('/api/research/run?force=true', { method: 'POST' });
      loadDashboardData();
    } catch (err) {
      console.error('Error launching research:', err);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <LeadsTab leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />;
      case 'exports':
        return <ExportsTab />;
      case 'clients':
        return <ClientsTab />;
      case 'exclusions':
        return <ExclusionsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <LeadsTab leads={leads} onSelectLead={(lead) => setSelectedLead(lead)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Side Purple Panel with Nav */}
      <aside className="side-purple-panel hidden md:block" style={{ backgroundColor: '#2e1065', color: '#ffffff' }}>
        <div className="flex items-start gap-3 mb-8">
          <Target className="w-7 h-7 text-white flex-shrink-0 mt-0.5" />
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-tight">
              Lead Intelligence
            </h1>
            <p className="text-xs text-purple-200 font-medium leading-relaxed mt-1">
              Daily Automated BD Prospecting Platform
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: '#ffffff',
                  borderLeft: isActive ? '3px solid #a855f7' : '3px solid transparent',
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-left text-sm font-semibold transition-all hover:bg-white/10 cursor-pointer w-full"
              >
                <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: isActive ? 1 : 0.7 }} />
                <span style={{ opacity: isActive ? 1 : 0.75 }}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Right Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onRunResearch={handleTriggerResearch}
          isSearching={runStatus?.isSearching || false}
          stats={stats}
        />

        {/* Mobile Tab Bar */}
        <div className="md:hidden flex overflow-x-auto border-b border-slate-200 bg-white px-2">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap cursor-pointer"
                style={{
                  color: isActive ? '#7e22ce' : '#64748b',
                  borderBottom: isActive ? '2px solid #7e22ce' : '2px solid transparent',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <main className="p-6 max-w-7xl w-full mx-auto">
          {renderActiveTab()}
        </main>
      </div>

      {/* Slide-over Right Panel for Lead Detail Inspection */}
      {selectedLead && (
        <CompanySlidePanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Real-time Progress Drawer */}
      {showProgressDrawer && (
        <ProgressDrawer
          status={runStatus}
          onClose={() => setShowProgressDrawer(false)}
        />
      )}
    </div>
  );
}
