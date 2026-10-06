import React from "react";
import { Store, User, MapPin } from "lucide-react";

export const Header = ({
  managerName = "Marcus Vance",
  clusterId = "Cluster STV-042",
}) => {
  return (
    <header className="bg-slate-900 text-white p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-6 shadow-md">
      <div className="flex items-center space-x-3 flex-wrap">
        <span className="bg-yellow-400 text-slate-900 font-extrabold px-2.5 py-1 rounded text-xs tracking-wider uppercase">
          DOLLAR GENERAL
        </span>
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">
          DG Cluster Assortment Advisor — Snacks (Small Town Value Cluster)
        </h1>
      </div>
      <div className="flex items-center space-x-4 text-xs text-slate-300">
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
          <User className="w-3.5 h-3.5 text-yellow-400" />
          <span>
            Category Manager:{" "}
            <strong className="text-white">{managerName}</strong>
          </span>
        </div>
        <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700">
          <MapPin className="w-3.5 h-3.5 text-yellow-400" />
          <span>{clusterId}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
