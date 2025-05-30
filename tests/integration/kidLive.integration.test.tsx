import { render, screen, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import KidDashboardClient from '@/app/kids/[kidId]/dashboard/KidDashboardClient';
import * as useKidLiveModule from '@/hooks/useKidLive';

// Mock the useKidLive hook module
vi.mock('@/hooks/useKidLive', () => ({
  useKidLive: vi.fn()
}));

describe('Kid Dashboard Live Updates Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update stars when receiving WebSocket broadcast', async () => {
    const mockKid = {
      id: 1,
      name: 'Test Kid',
      starTotal: 50,
      goals: [],
    };

    // Initial mock returns 50 stars
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 50,
      messages: [],
    });

    // Render the component
    const { rerender } = render(<KidDashboardClient kid={mockKid} />);
    
    // Initially should show 50 stars
    expect(screen.getByText('Test Kid ⭐ 50')).toBeInTheDocument();
    
    // Update mock to return 777 stars
    act(() => {
      vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
        stars: 777,
        messages: [],
      });
      rerender(<KidDashboardClient kid={mockKid} />);
    });
    
    // Should update to 777 stars
    expect(screen.getByText('Test Kid ⭐ 777')).toBeInTheDocument();
  });

  it('should display live messages', async () => {
    const mockKid = {
      id: 2,
      name: 'Another Kid',
      starTotal: 100,
      goals: [],
    };
    
    const testMessages = [
      { id: 1, content: 'Great job!', role: 'assistant', createdAt: new Date().toISOString() },
      { id: 2, content: 'Thanks!', role: 'user', createdAt: new Date().toISOString() },
    ];
    
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 100,
      messages: testMessages,
    });

    render(<KidDashboardClient kid={mockKid} />);
    
    expect(screen.getByText('Live Updates')).toBeInTheDocument();
    
    // Messages should be visible in the DOM (as JSON in pre tag)
    expect(screen.getByText(/Great job!/)).toBeInTheDocument();
    expect(screen.getByText(/Thanks!/)).toBeInTheDocument();
  });

  it('should handle multiple rapid updates', async () => {
    const mockKid = {
      id: 3,
      name: 'Rapid Kid',
      starTotal: 0,
      goals: [],
    };
    
    // Initial render
    vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
      stars: 0,
      messages: [],
    });

    const { rerender } = render(<KidDashboardClient kid={mockKid} />);
    
    // Simulate rapid star updates
    const updates = [10, 50, 100, 200, 500];
    
    for (const starCount of updates) {
      act(() => {
        vi.mocked(useKidLiveModule.useKidLive).mockReturnValue({
          stars: starCount,
          messages: [],
        });
        rerender(<KidDashboardClient kid={mockKid} />);
      });
      
      expect(screen.getByText(`Rapid Kid ⭐ ${starCount}`)).toBeInTheDocument();
    }
  });
}); 