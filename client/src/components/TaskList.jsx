import React, { useState, useMemo } from 'react';
import { Search, Inbox, AlertCircle } from 'lucide-react';
import TaskItem from './TaskItem';

export const TaskList = ({
  tasks = [],
  isLoading = false,
  error = null,
  onToggleComplete,
  onDeleteTask,
  searchTerm = '',
  onSearchChange,
}) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'completed'

  const counts = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Boolean(t.completed)).length;
    const active = total - completed;
    return { total, active, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by tab
      if (activeTab === 'active' && task.completed) return false;
      if (activeTab === 'completed' && !task.completed) return false;

      // Filter by search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (task.title || '').toLowerCase().includes(query);
      }

      return true;
    });
  }, [tasks, activeTab, searchTerm]);

  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* List Toolbar */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/80">
        <div className="flex gap-2 sm:gap-4 font-medium text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-1 transition-colors ${
              activeTab === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Tasks ({counts.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`pb-1 transition-colors ${
              activeTab === 'active'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Active ({counts.active})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`pb-1 transition-colors ${
              activeTab === 'completed'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-3 text-sm border border-slate-300 rounded-lg bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
            placeholder="Search tasks in list..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200 flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading && tasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm">Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            {searchTerm
              ? 'No matching tasks found'
              : activeTab === 'completed'
              ? 'No completed tasks yet'
              : activeTab === 'active'
              ? 'No active tasks'
              : 'No tasks in your list'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {searchTerm
              ? 'Try modifying your search term or clear the filter.'
              : 'Add your first task above to get started with managing your daily workload.'}
          </p>
        </div>
      ) : (
        /* Task List */
        <div className="divide-y divide-slate-200">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id || task.title}
              task={task}
              onToggleComplete={onToggleComplete}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TaskList;
