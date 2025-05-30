import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useStars } from './useStars'
import { launchConfetti } from '@/utils/confetti'

// Mock confetti
vi.mock('@/utils/confetti', () => ({
  launchConfetti: vi.fn()
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useStars hook', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock document.querySelector
    document.querySelector = vi.fn(() => {
      const element = document.createElement('div')
      element.setAttribute('data-stars-badge', '')
      return element
    })
  })

  it('returns initial stars when provided', () => {
    const { result } = renderHook(() => useStars(1, 5))
    
    expect(result.current.stars).toBe(5)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('fetches stars when no initial value provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Tommy', stars: 3 })
    })

    const { result } = renderHook(() => useStars(1))
    
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.stars).toBe(3)
    })

    expect(mockFetch).toHaveBeenCalledWith('/api/kids/1/stars')
  })

  it('handles fetch errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => useStars(1))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Network error')
    })
  })

  it('awards star with confetti', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Tommy', stars: 6 })
    })

    const { result } = renderHook(() => useStars(1, 5))
    
    await result.current.awardStar()

    expect(launchConfetti).toHaveBeenCalled()
    
    await waitFor(() => {
      expect(result.current.stars).toBe(6)
    })
  })

  it('refreshes stars data', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, name: 'Tommy', stars: 7 })
    })

    const { result } = renderHook(() => useStars(1, 5))
    
    await result.current.refresh()

    await waitFor(() => {
      expect(result.current.stars).toBe(7)
    })
  })

  it('handles non-ok responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Not Found'
    })

    const { result } = renderHook(() => useStars(1))

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to fetch stars: Not Found')
    })
  })
})