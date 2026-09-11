import React from 'react';
import {
  LayoutDashboard,
  Target,
  Rocket,
  Globe2,
  AlertTriangle,
  Database,
  ShieldAlert,
  History,
  FileSpreadsheet,
  Settings,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'leads', label: "Today's Leads", icon: Target, count: stats?.totalQualifiedLeads || 50 },
    { id: 'startups', label: 'Startups', icon: Rocket, count: stats?.startupsCount },
    { id: 'gcc', label: 'GCC Intelligence', icon: Globe2, count: stats?.gccCount },
    { id: 'review', label: 'Review Queue', icon: AlertTriangle, count: stats?.needsReviewCount, isWarn: true },
    { id: 'clients', label: 'Client Database', icon: Database, count: stats?.totalClientsCount },
    { id: 'exclusions', label: 'Excluded Log', icon: ShieldAlert, count: stats?.excludedZyoinRelationshipsCount },
    { id: 'history', label: 'Historical Intelligence', icon: History },
    { id: 'exports', label: 'Daily Reports', icon: FileSpreadsheet }
  ];

  return (
    <aside className="sidebar">
      <div>
        {/* Clean Header */}
        <div className="p-5 border-b border-purple-900/60 bg-purple-950/60">
          <h1 className="text-lg font-black tracking-wide text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-400" />
            <span>Lead Intelligence</span>
          </h1>
          <p className="text-[11px] text-purple-200/70 mt-1 font-medium">
            Daily Automated BD Prospecting Platform
          </p>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-purple-600/90 text-white shadow-xs'
                    : 'text-purple-100/70 hover:bg-purple-900/40 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-300/80'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    item.isWarn
                      ? 'bg-amber-500 text-gray-950'
                      : isActive
                      ? 'bg-purple-800 text-white'
                      : 'bg-purple-950/80 text-purple-200 border border-purple-800'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Automation Status */}
      <div className="p-4 border-t border-purple-900/60 bg-purple-950/60 space-y-2">
        <div className="p-2.5 rounded-lg bg-purple-900/40 border border-purple-800/60 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-purple-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" /> AUTOMATION
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
            </span>
          </div>
          <p className="text-[11px] text-purple-200/80 font-mono">Next run: 06:00 AM IST</p>
        </div>

        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-purple-200/80 hover:text-white hover:bg-purple-900/40 transition-colors ${
            activeTab === 'settings' ? 'bg-purple-600/90 text-white' : ''
          }`}
        >
          <Settings className="w-4 h-4 text-purple-300" />
          <span>System Settings</span>
        </button>
      </div>
    </aside>
  );
}
