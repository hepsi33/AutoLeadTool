import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, XCircle, ExternalLink, HelpCircle } from 'lucide-react';

export default function ReviewQueueTab({ onRefreshStats }) {
  const [queueItems, setQueueItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/review-queue');
      const data = await res.json();
      setQueueItems(data.filter(i => i.status === 'NEEDS_REVIEW'));
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await fetch(`/api/review-queue/${id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision })
      });
      fetchQueue();
      if (onRefreshStats) onRefreshStats();
    } catch (err) {
      console.error('Error updating review decision:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex items-center justify-between border-l-4 border-l-amber-500">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Needs Manual BD Review Queue
            </h2>
            <p className="text-xs text-gray-400">
              Companies with ambiguous Zyoin relationship evidence or parent/subsidiary matches requiring BD decision.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {queueItems.length} Ambiguous Flags
        </span>
      </div>

      <div className="glass-panel overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="bg-gray-900/80 text-gray-400 uppercase font-semibold border-b border-gray-800">
            <tr>
              <th className="p-3">Flag Date</th>
              <th className="p-3">Company</th>
              <th className="p-3">Category</th>
              <th className="p-3">Ambiguity Reason</th>
              <th className="p-3">Public Evidence</th>
              <th className="p-3">Decision Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {queueItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="p-3 font-mono text-gray-500">{item.dateFlagged}</td>
                <td className="p-3 font-bold text-white">{item.company}</td>
                <td className="p-3">
                  <span className={item.category === 'GCC' ? 'badge-gcc' : 'badge-startup'}>
                    {item.category}
                  </span>
                </td>
                <td className="p-3 text-amber-300 max-w-xs">{item.reason}</td>
                <td className="p-3 max-w-xs text-gray-400">
                  <div className="truncate">{item.evidence}</div>
                  {item.evidenceUrl && (
                    <a href={item.evidenceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline text-[11px] flex items-center gap-1 mt-0.5">
                      View Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDecision(item.id, 'EXISTING_CLIENT')}
                      className="btn-secondary text-[11px] py-1 px-2 hover:bg-rose-900/50 hover:text-rose-300 hover:border-rose-700"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      Mark Existing Client
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'PROSPECT')}
                      className="btn-secondary text-[11px] py-1 px-2 hover:bg-emerald-900/50 hover:text-emerald-300 hover:border-emerald-700"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Approve Prospect
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'IGNORED')}
                      className="btn-secondary text-[11px] py-1 px-2 text-gray-500"
                    >
                      Ignore
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {queueItems.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-400">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-75" />
            <p className="font-semibold text-white">Review Queue Clear!</p>
            <p className="text-xs text-gray-500 mt-0.5">All discovered companies passed clean verification.</p>
          </div>
        )}
      </div>
    </div>
  );
}
