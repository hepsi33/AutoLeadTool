import React from 'react';

export default function ZyoinLogo({ className = '', showSubtitle = true }) {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      {/* Official Transparent Zyoin Group Logo Asset */}
      <div className="bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-sm border border-purple-200/50 flex items-center justify-center w-fit">
        <img
          src="/zyoin-logo-transparent.png"
          alt="Zyoin Group Logo"
          className="h-8 w-auto object-contain"
        />
      </div>

      {showSubtitle && (
        <div className="mt-2.5">
          <span className="text-sm font-extrabold text-white tracking-wider uppercase block">
            Lead Intelligence
          </span>
          <span className="text-[11px] font-medium text-purple-200/80 block">
            AI-powered prospect research for BD
          </span>
        </div>
      )}
    </div>
  );
}
