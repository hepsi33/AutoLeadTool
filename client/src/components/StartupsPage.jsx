import React, { useState } from 'react';
import { Rocket, Search, Filter, ExternalLink, ChevronRight, Building2, MapPin } from 'lucide-react';

export default function StartupsPage({ leads, onSelectLead }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('ALL');
  const [locationFilter, setLocationFilter] = useState('ALL');

  const startupLeads = leads.filter(l => l.category === 'Startup');

  const industries = Array.from(new Set(startupLeads.map(l => l.industry))).filter(Boolean);
  const locations = Array.from(new Set(startupLeads.map(l => l.indiaLocations || l.hiringLocation))).filter(Boolean);

  const filtered = startupLeads.filter(lead => {
    if (industryFilter !== 'ALL' && lead.industry !== industryFilter) return false;
    if (locationFilter !== 'ALL' && (lead.indiaLocations || lead.hiringLocation) !== locationFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (lead.companyName || lead.company || '').toLowerCase();
      const ind = (lead.industry || '').toLowerCase();
      return name.includes(q) || ind.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="zyoin-card p-6 border-l-4 border-l-purple-700 flex flex-col md-flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase mb-1">
            <Rocket className="w-4 h-4 text-purple-600" /> STARTUP TALENT INTELLIGENCE
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Startup Intelligence</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            High-growth venture-backed companies and scaleups actively expanding tech teams in India.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-200">
          {startupLeads.length} Qualified Startups
        </span>
      </div>

      {/* Filters Bar */}
      <div className="zyoin-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full md-w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search startup name or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">All Industries</option>
            {industries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-medium"
          >
            <option value="ALL">All Locations</option>
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>
      </div>

      {/* Corporate Table */}
      <div className="zyoin-card overflow-hidden">
        <table className="zyoin-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Company</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Hiring Signal</th>
              <th>Growth Signal</th>
              <th>Zyoin Status</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.companyName || lead.company}>
                <td>
                  <span className={
                    lead.priority === 'HOT' ? 'badge-hot' :
                    lead.priority === 'HIGH' ? 'badge-high' : 'badge-medium'
                  }>
                    {lead.priority}
                  </span>
                </td>
                <td className="font-bold text-slate-900">{lead.companyName || lead.company}</td>
                <td>{lead.industry}</td>
                <td>{lead.indiaLocations || lead.hiringLocation}</td>
                <td className="max-w-xs truncate">{lead.hiringStatus} ({lead.relevantOpenings} roles)</td>
                <td className="max-w-xs truncate text-purple-700 font-medium">{lead.growthSignal}</td>
                <td>
                  <span className="badge-verified">🟢 Clean</span>
                </td>
                <td className="font-mono font-bold text-purple-900">{lead.leadScore}/100</td>
                <td>
                  <button onClick={() => onSelectLead(lead)} className="btn-zyoin-secondary text-[11px] py-1 px-2.5">
                    Inspect Panel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
