import React, { useState, useEffect } from 'react';
import { Settings, Clock, Globe, Target, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsTab() {
  const [settings, setSettings] = useState({
    scheduledTime: '06:00',
    timezone: 'Asia/Kolkata',
    dailyTargetLeads: 50,
    autoRunEnabled: true,
    retryAttempts: 3
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error loading settings:', err));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="glass-panel p-5 border-l-4 border-l-indigo-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Automated Scheduler & Discovery Settings</h2>
            <p className="text-xs text-gray-400">
              Configure background daily research schedule, timezone, target volumes, and retry rules.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 space-y-6 text-xs">
        {/* Schedule Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> Daily Research Execution Time (IST)
            </label>
            <input
              type="time"
              value={settings.scheduledTime}
              onChange={(e) => setSettings({ ...settings, scheduledTime: e.target.value })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">Default: 06:00 AM IST. Pipeline executes automatically before normal working hours.</p>
          </div>

          <div>
            <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-400" /> Primary System Timezone
            </label>
            <input
              type="text"
              readOnly
              value={settings.timezone}
              className="w-full bg-gray-900/60 border border-gray-800 rounded-lg p-2.5 text-gray-400 font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">Fixed to Asia/Kolkata to ensure exact Indian date alignment.</p>
          </div>
        </div>

        {/* Lead Target & Retries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-800">
          <div>
            <label className="block text-gray-300 font-bold mb-1 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-cyan-400" /> Daily Qualified Lead Target
            </label>
            <input
              type="number"
              min="10"
              max="100"
              value={settings.dailyTargetLeads}
              onChange={(e) => setSettings({ ...settings, dailyTargetLeads: parseInt(e.target.value) || 50 })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white font-mono"
            />
            <p className="text-[11px] text-gray-500 mt-1">Maximum qualified prospects generated per research cycle (Default: 50).</p>
          </div>

          <div>
            <label className="block text-gray-300 font-bold mb-1">Error Retry Policy</label>
            <select
              value={settings.retryAttempts}
              onChange={(e) => setSettings({ ...settings, retryAttempts: parseInt(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg p-2.5 text-white"
            >
              <option value={1}>1 Retry Attempt</option>
              <option value={3}>3 Retry Attempts (Recommended)</option>
              <option value={5}>5 Retry Attempts</option>
            </select>
            <p className="text-[11px] text-gray-500 mt-1">Automatic retry policy if network or API rate limits occur.</p>
          </div>
        </div>

        {/* Auto Run Toggle */}
        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Automated Background Execution</span>
            <span className="text-gray-400 text-xs">Allow server background scheduler to run daily without user intervention.</span>
          </div>

          <button
            type="button"
            onClick={() => setSettings({ ...settings, autoRunEnabled: !settings.autoRunEnabled })}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              settings.autoRunEnabled ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {settings.autoRunEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>

        <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
          {saved && (
            <span className="text-emerald-400 font-mono text-xs flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
          <button type="submit" className="btn-primary ml-auto">
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
