import { useState, useEffect, useCallback } from 'react'
import { launchConfetti } from '@/utils/confetti'

interface UseStarsResult {
  stars: number
  loading: boolean
  error: string | null
  awardStar: () => Promise<void>
  refresh: () => Promise<void>
}

export function useStars(kidId: number, initialStars?: number): UseStarsResult {
  const [stars, setStars] = useState(initialStars || 0)
  const [loading, setLoading] = useState(!initialStars)
  const [error, setError] = useState<string | null>(null)

  const fetchStars = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/kids/${kidId}/stars`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stars: ${response.statusText}`)
      }
      
      const data = await response.json()
      setStars(data.stars)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [kidId])

  const awardStar = useCallback(async () => {
    try {
      setError(null)
      
      // Optimistically update the UI
      const previousStars = stars
      setStars(prev => prev + 1)
      
      // Note: The actual star awarding happens through the goal update API
      // This is just for the UI update and confetti
      
      // Find the stars badge element for confetti origin
      const starsBadge = document.querySelector('[data-stars-badge]')
      if (starsBadge instanceof HTMLElement) {
        launchConfetti(starsBadge)
      }
      
      // Refresh from server to ensure consistency
      await fetchStars()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Revert on error
      await fetchStars()
    }
  }, [stars, fetchStars])

  useEffect(() => {
    if (!initialStars) {
      fetchStars()
    }
  }, [initialStars, fetchStars])

  return {
    stars,
    loading,
    error,
    awardStar,
    refresh: fetchStars
  }
}