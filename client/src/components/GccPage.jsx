import React, { useState } from 'react';
import { Globe2, Search, ExternalLink, MapPin, Building2 } from 'lucide-react';

export default function GccPage({ leads, onSelectLead }) {
  const [searchQuery, setSearchQuery] = useState('');
  const gccLeads = leads.filter(l => l.category === 'GCC');

  const filtered = gccLeads.filter(lead => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (lead.companyName || lead.company || '').toLowerCase();
      const parent = (lead.parentCompany || '').toLowerCase();
      const loc = (lead.indiaLocations || lead.hiringLocation || '').toLowerCase();
      return name.includes(q) || parent.includes(q) || loc.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="zyoin-card p-6 border-l-4 border-l-emerald-600 flex flex-col md-flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase mb-1">
            <Globe2 className="w-4 h-4 text-emerald-600" /> GLOBAL CAPABILITY CENTER INTELLIGENCE
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">GCC Intelligence</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Global Capability Centres & R&D hubs establishing or expanding technology footprints in India.
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200">
          {gccLeads.length} Qualified GCC Targets
        </span>
      </div>

      {/* Search */}
      <div className="zyoin-card p-4">
        <div className="relative w-full md-w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search GCC company, parent MNC, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900"
          />
        </div>
      </div>

      {/* GCC Table */}
      <div className="zyoin-card overflow-hidden">
        <table className="zyoin-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Parent MNC</th>
              <th>GCC Location</th>
              <th>Expansion Signal</th>
              <th>Hiring Volume</th>
              <th>Functions Hiring</th>
              <th>Potential Zyoin Service</th>
              <th>Score</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.companyName || lead.company}>
                <td className="font-bold text-slate-900">{lead.companyName || lead.company}</td>
                <td className="text-slate-600 font-medium">{lead.parentCompany || 'Global MNC'}</td>
                <td>{lead.indiaLocations || lead.hiringLocation}</td>
                <td className="max-w-xs truncate text-emerald-800 font-medium">{lead.growthSignal}</td>
                <td className="font-mono font-bold text-emerald-700">{lead.relevantOpenings} roles</td>
                <td className="max-w-xs truncate">{lead.keyRolesHiring}</td>
                <td className="max-w-xs truncate text-purple-700 font-medium">{lead.suggestedBdAngle}</td>
                <td className="font-mono font-bold text-purple-900">{lead.leadScore}/100</td>
                <td>
                  <button onClick={() => onSelectLead(lead)} className="btn-zyoin-secondary text-[11px] py-1 px-2.5">
                    Inspect
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
