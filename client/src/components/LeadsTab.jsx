import React, { useState } from 'react';
import { Search, Rocket, Globe2, Building2, MapPin } from 'lucide-react';

export default function LeadsTab({ leads, onSelectLead }) {
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter(lead => {
    if (categoryFilter !== 'ALL' && lead.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (lead.companyName || lead.company || '').toLowerCase();
      const ind = (lead.industry || '').toLowerCase();
      const loc = (lead.indiaLocations || lead.hiringLocation || '').toLowerCase();
      return name.includes(q) || ind.includes(q) || loc.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar: Search & Category Filters ONLY (All, Startups, GCC) */}
      <div className="zyoin-card p-4 flex flex-col md-flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md-w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search company, industry, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
          />
        </div>

        {/* Category Filters: All text in BLACK, NO Icons */}
        <div className="flex bg-slate-200/80 p-1 rounded-lg border border-slate-300 text-xs w-full md:w-auto justify-start font-bold">
          <button
            onClick={() => setCategoryFilter('ALL')}
            style={{ color: '#000000' }}
            className={`px-4 py-2 rounded-md font-extrabold transition-all text-xs ${
              categoryFilter === 'ALL'
                ? 'bg-slate-300 border-2 border-black shadow-2xs'
                : 'hover:bg-slate-300'
            }`}
          >
            All ({leads.length})
          </button>
          <button
            onClick={() => setCategoryFilter('Startup')}
            style={{ color: '#000000' }}
            className={`px-4 py-2 rounded-md font-extrabold transition-all text-xs ${
              categoryFilter === 'Startup'
                ? 'bg-slate-300 border-2 border-black shadow-2xs'
                : 'hover:bg-slate-300'
            }`}
          >
            Startups ({leads.filter(l => l.category === 'Startup').length})
          </button>
          <button
            onClick={() => setCategoryFilter('GCC')}
            style={{ color: '#000000' }}
            className={`px-4 py-2 rounded-md font-extrabold transition-all text-xs ${
              categoryFilter === 'GCC'
                ? 'bg-slate-300 border-2 border-black shadow-2xs'
                : 'hover:bg-slate-300'
            }`}
          >
            GCC ({leads.filter(l => l.category === 'GCC').length})
          </button>
        </div>
      </div>

      {/* Main Table View */}
      <div className="zyoin-card overflow-hidden">
        <table className="zyoin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Type</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Hiring Signal</th>
              <th>Growth Signal</th>
              <th>Exclusion Status</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, idx) => (
              <tr key={lead.companyName || lead.company}>
                <td className="font-mono text-slate-400 font-bold">#{idx + 1}</td>
                <td>
                  <span className="font-bold text-slate-900 block text-sm">{lead.companyName || lead.company}</span>
                </td>
                <td>
                  <span className={lead.category === 'GCC' ? 'badge-gcc' : 'badge-startup'}>
                    {lead.category}
                  </span>
                </td>
                <td className="text-slate-600">{lead.industry}</td>
                <td>{lead.indiaLocations || lead.hiringLocation}</td>
                <td className="max-w-xs truncate text-slate-700">
                  {lead.hiringStatus} ({lead.relevantOpenings} roles)
                </td>
                <td className="max-w-xs truncate text-purple-800 font-medium">
                  {lead.growthSignal}
                </td>
                <td>
                  <span className="badge-verified">🟢 Clean</span>
                </td>
                <td className="font-mono font-bold text-purple-900">
                  {lead.leadScore}/100
                </td>
                <td>
                  <button onClick={() => onSelectLead(lead)} className="btn-zyoin-secondary text-[11px] py-1 px-2.5">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredLeads.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            <p className="text-base font-semibold text-slate-800">No qualified leads found matching search query.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
