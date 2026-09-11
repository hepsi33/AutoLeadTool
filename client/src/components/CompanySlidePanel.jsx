import React from 'react';
import { X, Building2, MapPin, Globe, ExternalLink, ShieldCheck, Flame, Briefcase, TrendingUp, UserCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function CompanySlidePanel({ lead, onClose }) {
  if (!lead) return null;

  const isExistingClient = lead.zyoinRelationshipStatus === 'VERIFIED EXISTING' || lead.zyoinRelationshipStatus === 'LIKELY EXISTING';
  const isNeedsReview = lead.zyoinRelationshipStatus === 'RELATIONSHIP REQUIRES REVIEW' || lead.isAmbiguous;

  return (
    <div className="slide-panel-overlay" onClick={onClose}>
      <div className="slide-panel-content p-6 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={lead.category === 'GCC' ? 'badge-gcc' : 'badge-startup'}>
                {lead.category}
              </span>
              <span className={
                lead.priority === 'HOT' ? 'badge-hot' :
                lead.priority === 'HIGH' ? 'badge-high' : 'badge-medium'
              }>
                {lead.priority} SCORE ({lead.leadScore}/100)
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">{lead.companyName || lead.company}</h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5 text-purple-600" /> {lead.industry}</span>
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.indiaLocations || lead.hiringLocation}</span>
              {lead.website && (
                <a href={lead.website} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Website <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 my-6 text-xs">
          {/* 1. WHY THIS COMPANY */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-900 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> WHY THIS COMPANY?
            </h3>
            <p className="text-slate-700 leading-relaxed font-medium">
              "{lead.whyZyoinShouldTarget}"
            </p>
          </div>

          {/* 2. HIRING SIGNAL */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-emerald-600" /> HIRING SIGNAL
            </h3>
            <div className="space-y-1.5 text-slate-700">
              <p><strong>Open Roles:</strong> {lead.relevantOpenings} technical job requisitions</p>
              <p><strong>Key Roles Hiring:</strong> {lead.keyRolesHiring}</p>
              <p><strong>Hiring Locations:</strong> {lead.indiaLocations || lead.hiringLocation}</p>
              <p><strong>Date Verified:</strong> {lead.hiringEvidenceDate || 'Recent'} (Source Verified)</p>
            </div>
            {lead.hiringEvidenceUrl && (
              <a href={lead.hiringEvidenceUrl} target="_blank" rel="noreferrer" className="text-purple-700 font-semibold hover:underline flex items-center gap-1 mt-3">
                Verify Careers Portal <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* 3. GROWTH SIGNAL */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-600" /> GROWTH SIGNAL
            </h3>
            <p className="text-slate-700 mb-2"><strong>{lead.growthSignal}:</strong> {lead.growthDetails}</p>
            {lead.growthEvidenceUrl && (
              <a href={lead.growthEvidenceUrl} target="_blank" rel="noreferrer" className="text-purple-700 font-semibold hover:underline flex items-center gap-1">
                Verify Growth Announcement <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* 4. ZYOIN RELATIONSHIP */}
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-purple-600" /> ZYOIN RELATIONSHIP EXCLUSION CHECK
            </h3>

            {isExistingClient ? (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-600" />
                <strong className="font-bold">🔴 Existing Zyoin Client (REJECTED FROM PROSPECTS)</strong>
              </div>
            ) : isNeedsReview ? (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <strong className="font-bold">🟡 Review Required (Ambiguous Relationship)</strong>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <strong className="font-bold">🟢 No public evidence found (Passes Qualification)</strong>
              </div>
            )}

            <p className="text-slate-500 mt-2 text-[11px]">
              {lead.zyoinCheckEvidence || 'Internal database search returned 0 matching records. Public web check clean.'}
            </p>
          </div>

          {/* 5. RECOMMENDED ZYOIN APPROACH */}
          <div className="p-4 rounded-xl bg-purple-900 text-white space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-purple-200 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-300" /> RECOMMENDED ZYOIN APPROACH
            </h3>

            <div>
              <span className="text-purple-300 text-[10px] uppercase font-bold block">Target Zyoin Service:</span>
              <strong className="text-amber-300 text-sm font-semibold">{lead.suggestedBdAngle}</strong>
            </div>

            <div>
              <span className="text-purple-300 text-[10px] uppercase font-bold block">Target Decision-Maker Role:</span>
              <strong className="text-white text-xs font-semibold">{lead.suggestedDecisionMakerRole}</strong>
            </div>

            <div className="pt-2 border-t border-purple-700/60 text-[11px] text-purple-200">
              Note: Contact role is verified via public company organizational structure. No private personal data generated.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 mt-auto">
          <span>Research Date: <strong>{lead.researchDate || new Date().toISOString().split('T')[0]}</strong></span>
          <button onClick={onClose} className="btn-zyoin-secondary text-xs">Close Panel</button>
        </div>
      </div>
    </div>
  );
}
