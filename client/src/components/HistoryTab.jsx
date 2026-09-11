import React, { useState, useEffect } from 'react';
import { History, TrendingUp, Bell, Search } from 'lucide-react';

export default function HistoryTab() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        setHistory(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching history:', err));
  }, []);

  const filtered = history.filter(h =>
    h.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (h.status && h.status.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 border-l-4 border-l-cyan-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Historical Lead Intelligence Database</h2>
            <p className="text-xs text-gray-400">
              `company_history` - Deduplication log tracking company scores and new signal alerts over time.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          {history.length} Unique Companies Tracked
        </span>
      </div>

      <div className="glass-panel overflow-x-auto">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search historical company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white"
            />
          </div>
          <span className="text-xs text-gray-400 font-mono">Showing {filtered.length} entries</span>
        </div>

        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
            <tr>
              <th className="p-3">Company</th>
              <th className="p-3">First Discovered</th>
              <th className="p-3">Last Researched</th>
              <th className="p-3">Prev Score → Curr Score</th>
              <th className="p-3">Latest Hiring Signal</th>
              <th className="p-3">Status / New Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((item) => (
              <tr key={item.id || item.company} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-3 font-bold text-white">{item.company}</td>
                <td className="p-3 font-mono text-gray-500">{item.firstDiscovered}</td>
                <td className="p-3 font-mono text-gray-400">{item.lastResearched}</td>
                <td className="p-3 font-mono">
                  <span className="text-gray-500">{item.previousScore}</span> → <strong className="text-emerald-400">{item.currentScore}</strong>
                </td>
                <td className="p-3 text-gray-300 max-w-xs truncate">{item.currentHiringSignal}</td>
                <td className="p-3">
                  {item.newSignalAlert ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px] flex items-center gap-1 w-fit">
                      <Bell className="w-3 h-3 text-amber-400" /> {item.status}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-mono">{item.status}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
