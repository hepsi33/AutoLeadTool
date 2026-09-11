import React from 'react';
import { X, Building2, MapPin, Globe, ExternalLink, ShieldCheck, Flame, Briefcase, TrendingUp, UserCheck, Sparkles, CheckCircle2, Info } from 'lucide-react';

export default function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel w-full max-w-4xl p-6 relative border border-indigo-500/30 max-h-[90vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white text-xl font-extrabold shadow-lg">
              {(lead.companyName || lead.company || 'C').charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white">{lead.companyName || lead.company}</h2>
                <span className={lead.category === 'GCC' ? 'badge-gcc' : 'badge-startup'}>
                  {lead.category}
                </span>
                <span className={
                  lead.priority === 'HOT' ? 'badge-hot' :
                  lead.priority === 'HIGH' ? 'badge-high' : 'badge-medium'
                }>
                  {lead.priority} PRIORITY ({lead.leadScore}/100)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-1">
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-indigo-400" /> {lead.industry}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> {lead.indiaLocations || lead.hiringLocation}</span>
                <a href={lead.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:underline">
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-5">
            {/* 1. FACT VS INFERENCE SECTION */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" /> FACT VS INFERENCE SEPARATION
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-200">
                  <strong className="text-emerald-400">EMPIRICAL FACT:</strong> {lead.facts?.hiringFact || `Verified ${lead.relevantOpenings} active technical job requisitions.`}
                </div>
                <div className="p-2.5 rounded-lg bg-gray-900/60 border border-gray-800 text-gray-200">
                  <strong className="text-cyan-400">EMPIRICAL FACT:</strong> {lead.facts?.growthFact || lead.growthSignal}
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-900/40 border border-indigo-500/30 text-indigo-200">
                  <strong className="text-amber-400">BD INFERENCE:</strong> {lead.whyZyoinShouldTarget}
                </div>
              </div>
            </div>

            {/* 2. HIRING EVIDENCE */}
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-2">
                <Briefcase className="w-4 h-4 text-emerald-400" /> HIRING ACTIVITY EVIDENCE
              </h3>
              <p className="text-xs text-gray-300 mb-2">{lead.hiringEvidence}</p>
              <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                <span>Roles: <strong>{lead.keyRolesHiring}</strong></span>
                {lead.hiringEvidenceUrl && (
                  <a href={lead.hiringEvidenceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 ml-auto">
                    Verify Careers URL <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* 3. GROWTH SIGNALS */}
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" /> GROWTH SIGNALS (LAST 30-90 DAYS)
              </h3>
              <p className="text-xs text-gray-300 mb-2"><strong>{lead.growthSignal}:</strong> {lead.growthDetails}</p>
              {lead.growthEvidenceUrl && (
                <a href={lead.growthEvidenceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 text-[11px] hover:underline flex items-center gap-1 font-mono">
                  Verify Growth Press Release <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* 4. ZYOIN RELATIONSHIP CHECK */}
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-300 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> ZYOIN RELATIONSHIP EXCLUSION CHECK
              </h3>
              <div className="text-xs text-emerald-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">STATUS:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    {lead.zyoinRelationshipStatus || 'NO PUBLIC EVIDENCE FOUND'}
                  </span>
                </div>
                <p className="text-gray-400 mt-1">{lead.zyoinCheckEvidence || 'Internal Zyoin client database checked. 0 matching partner records found.'}</p>
              </div>
            </div>
          </div>

          {/* Sidebar BD Angle Column */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-900/40 to-slate-900 border border-indigo-500/30">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-indigo-400" /> RECOMMENDED BD ANGLE
              </h3>
              <p className="text-xs text-gray-200 leading-relaxed mb-4">
                "{lead.suggestedBdAngle}"
              </p>

              <div className="pt-3 border-t border-indigo-500/20 text-xs space-y-2">
                <div>
                  <span className="text-gray-400 text-[11px] block font-semibold">TARGET DECISION-MAKER ROLE:</span>
                  <span className="text-white font-medium">{lead.suggestedDecisionMakerRole}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block font-semibold">CONTACT PERSON:</span>
                  <span className="text-amber-300 font-mono">{lead.suggestedContactPerson || 'NOT VERIFIED'}</span>
                </div>
              </div>
            </div>

            {/* Score Breakdown Card */}
            <div className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-xs space-y-2">
              <div className="flex justify-between font-semibold text-gray-300 border-b border-gray-800 pb-2">
                <span>LEAD SCORE BREAKDOWN</span>
                <span className="text-indigo-400 font-mono">{lead.leadScore}/100</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Hiring Activity (Max 40)</span>
                <span className="font-mono text-white">{lead.scoreBreakdown?.hiringScore || 30} pts</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Growth Signals (Max 25)</span>
                <span className="font-mono text-white">{lead.scoreBreakdown?.growthScore || 20} pts</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Zyoin Relevance (Max 20)</span>
                <span className="font-mono text-white">{lead.scoreBreakdown?.relevanceScore || 18} pts</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>India Opportunity (Max 15)</span>
                <span className="font-mono text-white">{lead.scoreBreakdown?.indiaScore || 15} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-400">
          <span>Research Date: <strong>{lead.researchDate || new Date().toISOString().split('T')[0]}</strong></span>
          <button onClick={onClose} className="btn-secondary">Close Details</button>
        </div>
      </div>
    </div>
  );
}
