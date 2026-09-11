import React, { useState, useEffect } from 'react';
import { ShieldAlert, ExternalLink, Search } from 'lucide-react';

export default function ExclusionsTab() {
  const [exclusions, setExclusions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/exclusions')
      .then(res => res.json())
      .then(data => {
        setExclusions(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching exclusions:', err));
  }, []);

  const filtered = exclusions.filter(e =>
    e.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.exclusionReason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 border-l-4 border-l-rose-500 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Excluded Companies Audit Log</h2>
            <p className="text-xs text-gray-400">
              `excluded_companies` - Historical record of rejected companies and explicit rejection reasons.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
          {exclusions.length} Rejections Logged
        </span>
      </div>

      <div className="glass-panel overflow-x-auto">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search excluded company or reason..."
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
              <th className="p-3">Exclusion Reason</th>
              <th className="p-3">Zyoin Status</th>
              <th className="p-3">Evidence Details</th>
              <th className="p-3">Evidence URL</th>
              <th className="p-3">Date Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map((item) => (
              <tr key={item.id || item.company} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-3 font-bold text-white">{item.company}</td>
                <td className="p-3 text-rose-300 font-medium max-w-xs">{item.exclusionReason}</td>
                <td className="p-3 font-mono text-xs">{item.zyoinRelationshipStatus}</td>
                <td className="p-3 text-gray-400 max-w-xs truncate">{item.evidence}</td>
                <td className="p-3">
                  {item.evidenceUrl ? (
                    <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : <span className="text-gray-600">N/A</span>}
                </td>
                <td className="p-3 font-mono text-gray-500">{item.dateChecked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
