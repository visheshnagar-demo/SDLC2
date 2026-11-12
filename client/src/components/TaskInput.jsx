import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';

export const TaskInput = ({ onAddTask, isSubmitting = false }) => {
  const [title, setTitle] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    if (val.length <= 255) {
      setTitle(val);
      if (validationError) {
        setValidationError('');
      }
    } else {
      setValidationError('Task title cannot exceed 255 characters.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = title.trim();

    if (!trimmed) {
      setValidationError('Please enter a task title. Empty or whitespace-only tasks are not allowed.');
      return;
    }

    if (trimmed.length > 255) {
      setValidationError('Task title cannot exceed 255 characters.');
      return;
    }

    try {
      setValidationError('');
      await onAddTask(trimmed);
      setTitle('');
    } catch (err) {
      setValidationError(err?.response?.data?.message || err?.message || 'Failed to create task. Please try again.');
    }
  };

  return (
    <section className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <span>Add New Task</span>
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full h-11 pl-4 pr-24 border border-slate-300 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 disabled:bg-slate-50 disabled:text-slate-500"
            placeholder="What needs to be done today? (Max 255 characters)"
            value={title}
            onChange={handleChange}
            maxLength={255}
            disabled={isSubmitting}
            aria-label="New task title"
          />
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-0.5 rounded font-mono ${
              title.length > 240
                ? 'text-red-600 bg-red-50'
                : 'text-slate-500 bg-slate-100'
            }`}
          >
            {title.length} / 255
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 px-6 bg-[#4f46e5] text-white font-medium text-sm rounded-lg hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{isSubmitting ? 'Adding...' : 'Add Task'}</span>
        </button>
      </form>

      {validationError ? (
        <div
          role="alert"
          className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg animate-fadeIn"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      ) : (
        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
          Task title must be 1-255 characters long and cannot be empty or whitespace.
        </div>
      )}
    </section>
  );
};

export default TaskInput;
