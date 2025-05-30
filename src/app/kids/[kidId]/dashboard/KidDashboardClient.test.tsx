import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import KidDashboardClient from './KidDashboardClient';
import * as useKidLiveModule from '@/hooks/useKidLive';

// Mock the useKidLive hook
vi.mock('@/hooks/useKidLive', () => ({
  useKidLive: vi.fn()
}));

// Mock the GoalCard component
vi.mock('@/components/goals/GoalCard', () => ({
  default: ({ goal, onUpdate }: any) => (
    <div data-testid={`goal-card-${goal.id}`}>
      <h3>{goal.title}</h3>
      <p>{goal.desc}</p>
      <span>Progress: {goal.pctComplete}%</span>
    </div>
  )
}));

// Mock next navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: vi.fn()
  })
}));

describe('KidDashboardClient', () => {
  const mockKid = {
    id: 1,
    name: 'Test Kid',
    starTotal: 50,
    goals: [
      {
        id: 1,
        title: 'Learn to read',
        desc: 'Practice reading every day',
        pctComplete: 75,
      },
      {
        id: 2,
        title: 'Math homework',
        desc: 'Complete daily math exercises',
        pctComplete: 30,
      },
    ],
  };

  it('should display kid name and live stars', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: [],
    });
    
    render(<KidDashboardClient kid={mockKid} />);
    
    expect(screen.getByText('Test Kid ⭐ 100')).toBeInTheDocument();
  });

  it('should display goals', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: [],
    });
    
    render(<KidDashboardClient kid={mockKid} />);
    
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('Learn to read')).toBeInTheDocument();
    expect(screen.getByText('Practice reading every day')).toBeInTheDocument();
    expect(screen.getByText('Progress: 75%')).toBeInTheDocument();
    
    expect(screen.getByText('Math homework')).toBeInTheDocument();
    expect(screen.getByText('Complete daily math exercises')).toBeInTheDocument();
    expect(screen.getByText('Progress: 30%')).toBeInTheDocument();
  });

  it('should display live updates section', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: [
        { id: 1, content: 'Great job!', role: 'assistant', createdAt: new Date().toISOString() }
      ],
    });
    
    render(<KidDashboardClient kid={mockKid} />);
    
    expect(screen.getByText('Live Updates')).toBeInTheDocument();
    // The messages are rendered as JSON in a pre tag
    expect(screen.getByText(/Great job!/)).toBeInTheDocument();
  });

  it('should render without goals', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: [],
    });
    
    const kidWithoutGoals = { ...mockKid, goals: [] };
    render(<KidDashboardClient kid={kidWithoutGoals} />);
    
    expect(screen.getByText('Test Kid ⭐ 100')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });

  it('should render GoalCard components for each goal', () => {
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: [],
    });
    
    render(<KidDashboardClient kid={mockKid} />);
    
    // Check that GoalCard components are rendered
    expect(screen.getByTestId('goal-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('goal-card-2')).toBeInTheDocument();
  });
}); 