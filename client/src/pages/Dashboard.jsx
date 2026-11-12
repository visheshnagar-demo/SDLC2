import React, { useState, useEffect, useCallback } from 'react';
import AppHeader from '../components/AppHeader';
import TaskStats from '../components/TaskStats';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import { getTasks, createTask, updateTask, deleteTask } from '../services/api';

export const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getTasks();
      // Ensure data is array
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Could not load tasks from the server. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleAddTask = async (title) => {
    setIsSubmitting(true);
    try {
      const newTask = await createTask(title);
      // Append or prepend new task
      setTasks((prev) => [newTask, ...prev]);
    } catch (err) {
      console.error('Error creating task:', err);
      throw err; // rethrow so TaskInput shows the error message
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    // Find current task
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    // Optimistic UI update with rollback on failure
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );

    try {
      const updated = await updateTask(id, {
        completed,
        title: currentTask.title,
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
      );
    } catch (err) {
      console.error('Error updating task:', err);
      // Rollback
      setTasks(prevTasks);
      setError('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (id) => {
    const prevTasks = [...tasks];
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error deleting task:', err);
      // Rollback
      setTasks(prevTasks);
      setError('Failed to delete task. Please try again.');
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => Boolean(t.completed)).length;
  const activeTasks = totalTasks - completedTasks;

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col font-sans">
      <AppHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* KPI Dashboard */}
        <TaskStats
          total={totalTasks}
          active={activeTasks}
          completed={completedTasks}
        />

        {/* Task Creation Form */}
        <TaskInput
          onAddTask={handleAddTask}
          isSubmitting={isSubmitting}
        />

        {/* Task List Section */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          error={error}
          onToggleComplete={handleToggleComplete}
          onDeleteTask={handleDeleteTask}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </main>
    </div>
  );
};

export default Dashboard;
