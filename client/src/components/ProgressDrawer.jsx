import React from 'react';
import { Loader2, CheckCircle, Terminal, X, Search, ShieldCheck, Briefcase, TrendingUp, Layers, Award, FileSpreadsheet } from 'lucide-react';

export default function ProgressDrawer({ status, onClose }) {
  if (!status) return null;

  const steps = [
    { label: 'Discovering companies', icon: Search, threshold: 15 },
    { label: 'Checking Zyoin relationships', icon: ShieldCheck, threshold: 35 },
    { label: 'Checking hiring activity', icon: Briefcase, threshold: 50 },
    { label: 'Checking growth signals', icon: TrendingUp, threshold: 65 },
    { label: 'Verifying sources', icon: Layers, threshold: 75 },
    { label: 'Deduplicating', icon: Layers, threshold: 85 },
    { label: 'Scoring', icon: Award, threshold: 92 },
    { label: 'Generating Excel reports', icon: FileSpreadsheet, threshold: 100 }
  ];

  const currentProgress = status.progressPercent || 0;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-3xl p-6 relative border border-indigo-500/30 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400">
              {status.isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Today's Lead Intelligence Pipeline
              </h2>
              <p className="text-xs text-gray-400">{status.step}</p>
            </div>
          </div>

          {!status.isSearching && (
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="my-5">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-indigo-300">RESEARCH PROGRESS</span>
            <span className="text-indigo-400 font-mono">{currentProgress}%</span>
          </div>
          <div className="w-full bg-gray-900 h-3 rounded-full overflow-hidden p-0.5 border border-gray-800">
            <div
              className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          <div className="mt-2 text-right text-xs text-gray-400 font-mono">
            {status.currentCount} qualified leads identified
          </div>
        </div>

        {/* Pipeline Step Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          {steps.map((s, idx) => {
            const IconComponent = s.icon;
            const isDone = currentProgress >= s.threshold;
            const isActive = !isDone && currentProgress >= (steps[idx - 1]?.threshold || 0);

            return (
              <div
                key={s.label}
                className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 transition-all ${
                  isDone
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : isActive
                    ? 'bg-indigo-950/50 border-indigo-500/50 text-indigo-200 animate-pulse'
                    : 'bg-gray-900/40 border-gray-800 text-gray-500'
                }`}
              >
                {isDone ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <IconComponent className="w-4 h-4 flex-shrink-0 opacity-75" />
                )}
                <span className="truncate font-medium">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log Stream */}
        <div className="flex-1 min-h-[160px] bg-black/60 rounded-xl p-4 border border-gray-800 font-mono text-xs overflow-y-auto flex flex-col justify-end">
          <div className="flex items-center gap-2 pb-2 mb-2 border-b border-gray-800 text-gray-500 text-[11px]">
            <Terminal className="w-3.5 h-3.5" />
            <span>REAL-TIME AUDIT LOG TRAIL</span>
          </div>
          <div className="space-y-1">
            {(status.logs || []).map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed ${
                  log.includes('REJECTED')
                    ? 'text-rose-400'
                    : log.includes('QUALIFIED')
                    ? 'text-emerald-400'
                    : log.includes('SUCCESS')
                    ? 'text-cyan-300 font-bold'
                    : 'text-gray-300'
                }`}
              >
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        {!status.isSearching && (
          <div className="mt-5 text-right">
            <button onClick={onClose} className="btn-primary">
              View Today's Qualified Prospects
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
