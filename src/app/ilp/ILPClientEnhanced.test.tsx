import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ILPClientEnhanced from './ILPClientEnhanced'
import { launchConfetti } from '@/utils/confetti'

// Mock the confetti utility
vi.mock('@/utils/confetti', () => ({
  launchConfetti: vi.fn()
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ILPClientEnhanced - Star Integration', () => {
  const mockKidData = {
    kidName: 'Tommy',
    kidId: 1,
    initialStars: 2,
    goals: [
      {
        id: 1,
        kidId: 1,
        title: 'Reading Comprehension',
        desc: 'Improve reading skills',
        pct: 90,
        entries: []
      },
      {
        id: 2,
        kidId: 1,
        title: 'Math Problem Solving',
        desc: 'Master basic arithmetic',
        pct: 60,
        entries: []
      }
    ],
    activities: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock initial star fetch
    mockFetch.mockImplementation((url) => {
      if (url === '/api/kids/1/stars') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, name: 'Tommy', stars: 2 })
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('displays initial stars from props', () => {
    render(<ILPClientEnhanced {...mockKidData} />)
    
    const starsBadge = screen.getByText('2')
    expect(starsBadge).toBeInTheDocument()
    expect(screen.getByText('stars earned')).toBeInTheDocument()
  })

  it('updates goal progress and awards star on completion', async () => {
    // Mock successful goal update that awards a star
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/goals/1' && options?.method === 'PATCH') {
        const body = JSON.parse(options.body)
        return Promise.resolve({
          ok: true,
          json: async () => ({
            goal: { id: 1, pct: body.pct },
            starAwarded: body.pct === 100
          })
        })
      }
      if (url === '/api/kids/1/stars') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, name: 'Tommy', stars: 3 })
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<ILPClientEnhanced {...mockKidData} />)
    
    // Find and click the Complete button for the first goal
    const completeButtons = screen.getAllByText('Complete')
    fireEvent.click(completeButtons[0])

    // Wait for the API calls
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/goals/1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pct: 100 })
      })
    })

    // Verify confetti was launched
    await waitFor(() => {
      expect(launchConfetti).toHaveBeenCalled()
    })

    // Verify stars were updated
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/kids/1/stars')
    })
  })

  it('increments progress by 10% without awarding star', async () => {
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/goals/2' && options?.method === 'PATCH') {
        const body = JSON.parse(options.body)
        return Promise.resolve({
          ok: true,
          json: async () => ({
            goal: { id: 2, pct: body.pct },
            starAwarded: false
          })
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<ILPClientEnhanced {...mockKidData} />)
    
    // Find and click the +10% button for the second goal
    const incrementButtons = screen.getAllByText('+10%')
    fireEvent.click(incrementButtons[1])

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/goals/2', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pct: 70 })
      })
    })

    // Verify confetti was NOT launched
    expect(launchConfetti).not.toHaveBeenCalled()
  })

  it('disables buttons when goal is complete', () => {
    const completedGoalData = {
      ...mockKidData,
      goals: [
        {
          id: 1,
          kidId: 1,
          title: 'Completed Goal',
          desc: 'Already done',
          pct: 100,
          entries: []
        }
      ]
    }

    render(<ILPClientEnhanced {...completedGoalData} />)
    
    const incrementButton = screen.getByText('+10%')
    const completeButton = screen.getByText('Complete')
    
    expect(incrementButton).toBeDisabled()
    expect(completeButton).toBeDisabled()
  })

  it('shows loading state during update', async () => {
    // Mock a slow API response
    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))

    render(<ILPClientEnhanced {...mockKidData} />)
    
    const incrementButton = screen.getAllByText('+10%')[0]
    fireEvent.click(incrementButton)

    // Check for loading indicator
    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })
  })

  it('handles API errors gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<ILPClientEnhanced {...mockKidData} />)
    
    const incrementButton = screen.getAllByText('+10%')[0]
    fireEvent.click(incrementButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating goal:', expect.any(Error))
    })

    consoleSpy.mockRestore()
  })

  it('finds stars badge element for confetti origin', async () => {
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/goals/1' && options?.method === 'PATCH') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            goal: { id: 1, pct: 100 },
            starAwarded: true
          })
        })
      }
      if (url === '/api/kids/1/stars') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ id: 1, name: 'Tommy', stars: 3 })
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    const { container } = render(<ILPClientEnhanced {...mockKidData} />)
    
    // Verify stars badge has the data attribute
    const starsBadge = container.querySelector('[data-stars-badge]')
    expect(starsBadge).toBeInTheDocument()

    // Complete a goal
    const completeButton = screen.getAllByText('Complete')[0]
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(launchConfetti).toHaveBeenCalledWith(starsBadge)
    })
  })
})