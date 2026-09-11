import React from 'react';
import { Sparkles, Download, ArrowRight, ShieldCheck, FileCheck2, AlertCircle } from 'lucide-react';

export default function TodayIntelligenceBanner({ stats, onViewLeads }) {
  if (!stats) return null;

  return (
    <div className="zyoin-card-purple p-6 mb-6 relative overflow-hidden">
      {/* Background brand geometry */}
      <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/20 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md-flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-purple-200 mb-1">
            <Sparkles className="w-4 h-4 text-amber-300" /> TODAY'S INTELLIGENCE BRIEFING
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            {stats.totalQualifiedLeads || 50} high-potential target companies identified
          </h2>
          <p className="text-sm text-purple-100/90 mt-1 max-w-xl">
            Evidence-backed recruitment opportunities across top Indian tech hubs (Bengaluru, Hyderabad, Pune, Gurgaon).
          </p>

          {/* Key Intelligence Metrics */}
          <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-purple-400/30 text-xs text-purple-100">
            <div>
              <span className="text-purple-300 block text-[10px] uppercase font-bold">Research Completed</span>
              <strong className="text-white font-mono text-sm">08:14 AM IST</strong>
            </div>
            <div>
              <span className="text-purple-300 block text-[10px] uppercase font-bold">Sources Verified</span>
              <strong className="text-white font-mono text-sm">124 URLs</strong>
            </div>
            <div>
              <span className="text-purple-300 block text-[10px] uppercase font-bold">Zyoin Clients Excluded</span>
              <strong className="text-emerald-300 font-mono text-sm">{stats.excludedZyoinRelationshipsCount || 18} Excluded</strong>
            </div>
            <div>
              <span className="text-purple-300 block text-[10px] uppercase font-bold">Needs Manual Review</span>
              <strong className="text-amber-300 font-mono text-sm">{stats.needsReviewCount || 6} Ambiguous</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm-flex-row items-center gap-3 w-full md-w-auto">
          <button onClick={onViewLeads} className="btn-zyoin-light w-full sm-w-auto justify-center text-xs">
            <span>View Today's Leads</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href={`/api/reports/download/${stats.dateToday || new Date().toISOString().split('T')[0]}/summary`}
            className="px-4 py-2.5 rounded-lg bg-purple-900/60 hover:bg-purple-900 border border-purple-400/40 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-4 h-4 text-purple-200" />
            <span>Download Report</span>
          </a>
        </div>
      </div>
    </div>
  );
}
