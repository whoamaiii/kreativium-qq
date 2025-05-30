import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ILPClient from './ILPClient';
import { createMockGoal, createMockEntry, type GoalData, type EntryData } from './testHelpers';

describe('ILPClient Component', () => {
  const mockGoals: GoalData[] = [
    createMockGoal({
      id: 1,
      title: 'Reading Comprehension',
      desc: 'Improve by 20% this semester.',
      pct: 75,
      pctComplete: 75,
    }),
    createMockGoal({
      id: 2,
      title: 'Math Problem Solving',
      desc: 'Increase accuracy by 15%.',
      pct: 60,
      pctComplete: 60,
    }),
  ];

  const mockActivities: EntryData[] = [
    createMockEntry({
      id: 101,
      activity: 'Reading Practice',
      subject: 'English',
      status: 'COMPLETED',
      due: new Date('2025-03-15T00:00:00.000Z'),
      delta: 10,
      goalId: 1,
    }),
    createMockEntry({
      id: 102,
      activity: 'Math Quiz',
      subject: 'Mathematics',
      status: 'IN_PROGRESS',
      due: new Date('2025-03-20T00:00:00.000Z'),
      delta: 5,
      goalId: 1,
    }),
  ];

  it('renders goal progress', () => {
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    expect(screen.getByText('Individualized Learning Plan: Tommy')).toBeInTheDocument();
    expect(screen.getByText('Goal Progress')).toBeInTheDocument();
    expect(screen.getByText('Reading Comprehension')).toBeInTheDocument();
    expect(screen.getByText('Math Problem Solving')).toBeInTheDocument();
  });

  it('displays percentage correctly', () => {
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows activity list', () => {
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    expect(screen.getByText('Activity Log')).toBeInTheDocument();
    expect(screen.getByText('Reading Practice')).toBeInTheDocument();
    expect(screen.getByText('Math Quiz')).toBeInTheDocument();
  });

  it('renders export button', () => {
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    const exportButton = screen.getByText('Export PDF');
    expect(exportButton).toBeInTheDocument();
  });
});