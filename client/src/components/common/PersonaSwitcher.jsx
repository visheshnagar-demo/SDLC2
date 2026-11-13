import React, { useState } from "react";
import { PERSONAS } from "../../services/mockData";
import { UserCheck, Shield, ChevronDown } from "lucide-react";

export default function PersonaSwitcher({
  currentPersonaKey,
  onSelectPersona,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const activePersona = PERSONAS[currentPersonaKey] || PERSONAS.underwriter;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-white text-xs font-medium transition shadow-sm"
        aria-label="Switch Persona"
      >
        <span
          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-white ${activePersona.badgeColor}`}
        >
          {activePersona.avatar}
        </span>
        <div className="text-left hidden sm:block">
          <div className="font-semibold text-slate-100 leading-tight">
            {activePersona.name}
          </div>
          <div className="text-[10px] text-teal-400 leading-tight">
            {activePersona.shortRole} • Auth: {activePersona.authorityLimit}
          </div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-2xl bg-slate-900 border border-slate-700/80 ring-1 ring-black ring-opacity-5 z-50 p-2">
          <div className="px-3 py-2 border-b border-slate-800 mb-1">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Simulate Human Persona
            </p>
            <p className="text-xs text-slate-300 mt-0.5">
              Switch perspective to test role-based authorities & approval gates
            </p>
          </div>
          <div className="space-y-1">
            {Object.values(PERSONAS).map((p) => {
              const isSelected = p.id === currentPersonaKey;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectPersona(p.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-2.5 py-2 rounded-lg text-left text-xs transition ${
                    isSelected
                      ? "bg-teal-900/40 border border-teal-500/40 text-teal-100"
                      : "hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs text-white ${p.badgeColor}`}
                  >
                    {p.avatar}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white flex items-center justify-between">
                      <span>{p.name}</span>
                      {isSelected && (
                        <span className="text-[10px] text-teal-400 font-semibold uppercase">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">{p.role}</div>
                    <div className="text-[10px] text-teal-300 font-mono mt-0.5">
                      Auth Limit: {p.authorityLimit}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
