import React from 'react';
import { Target, Calendar, Play, Loader2, FileSpreadsheet } from 'lucide-react';

export default function Header({ onRunResearch, isSearching, stats }) {
  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleDownloadExcel = () => {
    // Create a temporary anchor to trigger browser download
    const link = document.createElement('a');
    link.href = '/api/export/summary';
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs mb-6 px-8 py-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Title & Greeting Info (First line removed per 1st image instruction, padded to the right) */}
        <div className="pl-4">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Good morning, Hephzibah
          </h1>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <span>Today's Lead Intelligence Target Summary</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <Calendar className="w-3.5 h-3.5 text-purple-600" /> {todayStr}
            </span>
          </p>
        </div>

        {/* Right Side: Status Badge, Download Report Button & Manual Run Option */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end pr-2">
          {/* Research Complete Badge */}
          <div className="px-3.5 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Research Complete</span>
          </div>

          {/* Download Report Excel Button */}
          <button
            onClick={handleDownloadExcel}
            style={{ backgroundColor: '#15803d', color: '#ffffff' }}
            className="px-4 py-2.5 rounded-lg text-white font-bold text-xs transition-all flex items-center gap-2 shadow-sm hover:bg-emerald-800 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" />
            <span>Download Today's Report (.xlsx)</span>
          </button>

          {/* Manual Run Research Option */}
          <button
            onClick={onRunResearch}
            disabled={isSearching}
            style={{ backgroundColor: '#ffffff', color: '#334155', borderColor: '#cbd5e1' }}
            className={`px-3.5 py-2.5 rounded-lg border text-slate-700 font-semibold text-xs transition-all flex items-center gap-1.5 ${
              isSearching ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'
            }`}
          >
            {isSearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />
                <span>Run Research Now</span>
              </>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
