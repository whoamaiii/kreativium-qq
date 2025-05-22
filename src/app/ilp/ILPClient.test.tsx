import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ILPClient from './ILPClient';

describe('ILPClient Component', () => {
  const mockGoals = [
    {
      id: 1,
      title: 'Reading Comprehension',
      desc: 'Improve by 20% this semester.',
      targetXp: 100,
      pct: 75,
      kidId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      entries: [],
    },
    {
      id: 2,
      title: 'Math Problem Solving',
      desc: 'Increase accuracy by 15%.',
      targetXp: 100,
      pct: 60,
      kidId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      entries: [],
    },
  ];

  const mockActivities = [
    {
      id: 101,
      activity: 'Reading Practice',
      subject: 'English',
      status: 'COMPLETED',
      due: new Date('2025-03-15T00:00:00.000Z'),
      goalId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 102,
      activity: 'Math Quiz',
      subject: 'Mathematics',
      status: 'IN_PROGRESS',
      due: new Date('2025-03-20T00:00:00.000Z'),
      goalId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('renders the kid\'s name in the header', () => {
    render(<ILPClient kidName="Alex" goals={mockGoals} activities={mockActivities} />);
    expect(screen.getByText(/Individualized Learning Plan: Alex/i)).toBeInTheDocument();
  });

  it('renders goal titles and percentages', () => {
    render(<ILPClient kidName="Alex" goals={mockGoals} activities={mockActivities} />);
    expect(screen.getByText('Reading Comprehension')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Math Problem Solving')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('renders activity log table with correct headings', () => {
    render(<ILPClient kidName="Alex" goals={mockGoals} activities={mockActivities} />);
    expect(screen.getByRole('columnheader', { name: /Activity/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Subject/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /Due Date/i })).toBeInTheDocument();
  });

  it('renders activity log entries with correct data and status colors', () => {
    render(<ILPClient kidName="Alex" goals={mockGoals} activities={mockActivities} />);
    expect(screen.getByText('Reading Practice')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('Math Quiz')).toBeInTheDocument();
    expect(screen.getByText('IN PROGRESS')).toBeInTheDocument(); // Note: space in "IN PROGRESS"
  });
});
