import React from 'react';
import { CheckCircle, Clock, ListTodo, TrendingUp } from 'lucide-react';

export const TaskStats = ({ total = 0, active = 0, completed = 0 }) => {
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Task Statistics">
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider">Total Tasks</span>
          <ListTodo className="w-4 h-4 text-indigo-500" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{total}</p>
        <div className="mt-2 flex items-center text-xs text-indigo-600 font-medium">
          <span>{total > 0 ? 'Managed in system' : 'No tasks yet'}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider">Active Pending</span>
          <Clock className="w-4 h-4 text-amber-500" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{active}</p>
        <div className="mt-2">
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium inline-block">
            In Progress
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider">Completed Tasks</span>
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{completed}</p>
        <div className="mt-2">
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium inline-block">
            {completionRate}% Done
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-xs uppercase font-semibold tracking-wider">Completion Rate</span>
          <TrendingUp className="w-4 h-4 text-indigo-600" />
        </div>
        <p className="text-3xl font-bold text-slate-900">{completionRate}%</p>
        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </section>
  );
};

export default TaskStats;
