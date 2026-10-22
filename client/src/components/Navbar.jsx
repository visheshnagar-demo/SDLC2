import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Layers,
  GitBranch,
  Shield,
  Sparkles,
  FolderKanban,
} from "lucide-react";

export const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
                  SDLC Platform
                </span>
                <span className="block text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  Automated Lifecycle
                </span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                  isActive("/") && !location.pathname.startsWith("/project")
                    ? "bg-slate-800 text-cyan-400"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <FolderKanban className="w-4 h-4" />
                Projects
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 font-mono">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              <span>visheshnagar-demo/SDLC2</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Orchestrator Ready</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
