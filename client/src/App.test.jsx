import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import * as api from './services/api';

vi.mock('./services/api', () => ({
  getTasks: vi.fn().mockResolvedValue([
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Sample Task for Testing',
      completed: false,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ]),
  createTask: vi.fn().mockImplementation((title) =>
    Promise.resolve({
      id: '123e4567-e89b-12d3-a456-426614174001',
      title,
      completed: false,
    })
  ),
  updateTask: vi.fn().mockResolvedValue({}),
  deleteTask: vi.fn().mockResolvedValue({}),
}));

describe('TaskFlow App Component Tests', () => {
  it('renders application header and title', () => {
    render(<App />);
    expect(screen.getByText('TaskFlow')).toBeInTheDocument();
  });

  it('renders task statistics section', () => {
    render(<App />);
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('Active Pending')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks')).toBeInTheDocument();
    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
  });

  it('renders add new task form and input', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Add New Task/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/What needs to be done today/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Task/i })).toBeInTheDocument();
  });

  it('renders task list container with filter buttons', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /All Tasks/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Completed/i })).toBeInTheDocument();
  });
});
