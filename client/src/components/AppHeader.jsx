import React from 'react';
import { CheckCircle2, Search, Bell } from 'lucide-react';

export const AppHeader = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="w-full h-16 px-4 sm:px-8 flex items-center justify-between z-50 sticky top-0 bg-[#213145] text-white border-b border-slate-700 shadow-sm">
      <div className="flex items-center gap-6">
        <a className="flex items-center gap-2" href="#">
          <div className="w-9 h-9 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white font-bold shadow-inner">
            TF
          </div>
          <span className="text-xl font-bold tracking-tight">TaskFlow</span>
        </a>
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            className="w-80 h-9 pl-9 pr-4 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            placeholder="Search tasks..."
            type="text"
            value={searchTerm || ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-emerald-900/50 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Live System: Synced
        </span>

        <button
          type="button"
          aria-label="Notifications"
          className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-700">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold ring-2 ring-[#4f46e5]">
            AR
          </div>
          <span className="hidden md:inline-block text-sm font-medium text-slate-200">
            Alex Rivera
          </span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
