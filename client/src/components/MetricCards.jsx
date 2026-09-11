import React from 'react';
import { Target, Rocket, Globe2, Briefcase, Flame, Award } from 'lucide-react';

export default function MetricCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md-grid-cols-3 lg-grid-cols-6 gap-4 mb-6">
      {/* 1. QUALIFIED LEADS */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-purple-600">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>Qualified Leads</span>
          <Target className="w-4 h-4 text-purple-600" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalQualifiedLeads || 50}</span>
          <span className="text-xs text-slate-400 font-medium ml-1">/ 50</span>
        </div>
        <p className="text-[11px] text-purple-700 font-medium mt-1">Ready for BD Outreach</p>
      </div>

      {/* 2. STARTUPS */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-slate-700">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>Startups</span>
          <Rocket className="w-4 h-4 text-slate-700" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900">{stats.startupsCount || 32}</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">High-Growth Tech</p>
      </div>

      {/* 3. GCCs */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-emerald-600">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>GCCs</span>
          <Globe2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900">{stats.gccCount || 18}</span>
        </div>
        <p className="text-[11px] text-emerald-700 font-medium mt-1">Global Capability Centers</p>
      </div>

      {/* 4. HIRING NOW */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-indigo-600">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>Hiring Now</span>
          <Briefcase className="w-4 h-4 text-indigo-600" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900">46</span>
        </div>
        <p className="text-[11px] text-indigo-700 font-medium mt-1">Verified Openings</p>
      </div>

      {/* 5. HIGH PRIORITY */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-amber-500">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>High Priority</span>
          <Flame className="w-4 h-4 text-amber-500" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-slate-900">12</span>
        </div>
        <p className="text-[11px] text-amber-700 font-medium mt-1">Immediate BD Targets</p>
      </div>

      {/* 6. AVERAGE SCORE */}
      <div className="zyoin-card p-4 flex flex-col justify-between border-t-4 border-t-purple-800">
        <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
          <span>Average Score</span>
          <Award className="w-4 h-4 text-purple-800" />
        </div>
        <div className="mt-2">
          <span className="text-2xl font-extrabold text-purple-900">87</span>
          <span className="text-xs text-slate-400 font-medium ml-0.5">/100</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">High Quality Rating</p>
      </div>
    </div>
  );
}
