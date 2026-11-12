import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

export const TaskItem = ({ task, onToggleComplete, onDeleteTask }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    if (isUpdating || isDeleting) return;
    try {
      setIsUpdating(true);
      await onToggleComplete(task.id, !task.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting || isUpdating) return;
    try {
      setIsDeleting(true);
      await onDeleteTask(task.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`p-4 flex items-center justify-between gap-4 transition-colors hover:bg-slate-50 ${
        task.completed ? 'bg-slate-50/60' : 'bg-white'
      }`}
    >
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <label className="relative flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(task.completed)}
            onChange={handleToggle}
            disabled={isUpdating || isDeleting}
            className="w-5 h-5 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
            aria-label={`Mark "${task.title}" as ${task.completed ? 'pending' : 'completed'}`}
          />
        </label>

        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium break-words transition-all ${
              task.completed
                ? 'line-through text-slate-400'
                : 'text-slate-900'
            }`}
          >
            {task.title}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {task.completed ? (
          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium inline-block">
            Completed
          </span>
        ) : (
          <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-medium inline-block">
            Pending
          </span>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting || isUpdating}
          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
          title="Delete task"
          aria-label={`Delete task "${task.title}"`}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin text-red-500" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
