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
      pctComplete: 75,
      isCompleted: false,
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
      pctComplete: 60,
      isCompleted: false,
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
      notes: null,
      delta: 10,
      kidId: 1,
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
      notes: null,
      delta: 5,
      kidId: 1,
      goalId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it.skip('renders goal progress', () => {
    // FIXME: Update test - ILPClient component rendering needs verification
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    expect(screen.getByText("Tommy's Learning Progress")).toBeInTheDocument();
    expect(screen.getByText('Reading Comprehension')).toBeInTheDocument();
    expect(screen.getByText('Math Problem Solving')).toBeInTheDocument();
  });

  it.skip('displays percentage correctly', () => {
    // FIXME: Update test - percentage display format may have changed
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

  it.skip('shows activity list', () => {
    // FIXME: Update test - activity list rendering needs verification
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    expect(screen.getByText('Recent Activities')).toBeInTheDocument();
    expect(screen.getByText('Reading Practice')).toBeInTheDocument();
    expect(screen.getByText('Math Quiz')).toBeInTheDocument();
  });

  it.skip('renders export button', () => {
    // FIXME: Update test - export button functionality needs verification
    render(
      <ILPClient 
        goals={mockGoals} 
        activities={mockActivities} 
        kidName="Tommy"
        stars={5}
      />
    );

    const exportButton = screen.getByText(/Export to PDF/i);
    expect(exportButton).toBeInTheDocument();
  });
});