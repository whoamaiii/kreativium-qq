import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import GoalCard from './GoalCard'

// Mock fetch
global.fetch = vi.fn()

describe('GoalCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockReset()
  })

  const mockGoal = {
    id: 1,
    title: 'Learn to read',
    desc: 'Practice reading every day',
    pctComplete: 25
  }

  it('should render goal information', () => {
    render(<GoalCard goal={mockGoal} />)

    expect(screen.getByText('Learn to read')).toBeInTheDocument()
    expect(screen.getByText('Practice reading every day')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('Progress')).toBeInTheDocument()
  })

  it('should render without description', () => {
    const goalWithoutDesc = { ...mockGoal, desc: null }
    render(<GoalCard goal={goalWithoutDesc} />)

    expect(screen.getByText('Learn to read')).toBeInTheDocument()
    expect(screen.queryByText('Practice reading every day')).not.toBeInTheDocument()
  })

  it('should show green progress bar for < 50%', () => {
    render(<GoalCard goal={mockGoal} />)

    // Find the progress bar by looking for the element with the width style
    const progressBar = document.querySelector('[style*="width: 25%"]')
    expect(progressBar).toHaveClass('bg-green-500')
    expect(screen.getByText('25%')).toHaveClass('text-green-400')
  })

  it('should show yellow progress bar for 50-99%', () => {
    const goalAt75 = { ...mockGoal, pctComplete: 75 }
    render(<GoalCard goal={goalAt75} />)

    const progressBar = document.querySelector('[style*="width: 75%"]')
    expect(progressBar).toHaveClass('bg-yellow-500')
    expect(screen.getByText('75%')).toHaveClass('text-yellow-400')
  })

  it('should show purple progress bar and "Completed" for 100%', () => {
    const goalAt100 = { ...mockGoal, pctComplete: 100 }
    render(<GoalCard goal={goalAt100} />)

    const progressBar = document.querySelector('[style*="width: 100%"]')
    expect(progressBar).toHaveClass('bg-purple-500')
    expect(screen.getByText(/100%.*Completed/)).toHaveClass('text-purple-400')
    expect(screen.getByText(/Completed/)).toBeInTheDocument()
  })

  it('should open modal when clicking on progress bar', async () => {
    const user = userEvent.setup()
    render(<GoalCard goal={mockGoal} />)

    // Click on the progress bar area
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    expect(screen.getByText('Update Progress')).toBeInTheDocument()
    expect(screen.getByText('Goal: Learn to read')).toBeInTheDocument()
    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
  })

  it('should close modal when clicking cancel', async () => {
    const user = userEvent.setup()
    render(<GoalCard goal={mockGoal} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    // Click cancel
    await user.click(screen.getByText('Cancel'))

    expect(screen.queryByText('Update Progress')).not.toBeInTheDocument()
  })

  it('should update goal progress successfully', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...mockGoal, pctComplete: 50 })
    })

    render(<GoalCard goal={mockGoal} onUpdate={onUpdate} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    // Change percentage
    const input = screen.getByDisplayValue('25')
    await user.clear(input)
    await user.type(input, '50')

    // Click update
    await user.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/goals/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pctComplete: 50
        })
      })
    })

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled()
      expect(screen.queryByText('Update Progress')).not.toBeInTheDocument()
    })
  })

  it('should show error for invalid percentage', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(<GoalCard goal={mockGoal} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    // Enter invalid percentage
    const input = screen.getByDisplayValue('25')
    await user.clear(input)
    await user.type(input, '150')

    // Click update
    await user.click(screen.getByText('Update'))

    expect(alertSpy).toHaveBeenCalledWith('Please enter a valid percentage between 0 and 100')
    expect(global.fetch).not.toHaveBeenCalled()

    alertSpy.mockRestore()
  })

  it('should handle API errors gracefully', async () => {
    const user = userEvent.setup()
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

    render(<GoalCard goal={mockGoal} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    // Click update
    await user.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to update goal progress')
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating goal:', expect.any(Error))
    })

    alertSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('should show loading state during update', async () => {
    const user = userEvent.setup()
    
    let resolvePromise: any
    const fetchPromise = new Promise(resolve => {
      resolvePromise = resolve
    })

    ;(global.fetch as any).mockImplementationOnce(() => fetchPromise)

    render(<GoalCard goal={mockGoal} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    // Click update
    await user.click(screen.getByText('Update'))

    // Should show updating state
    expect(screen.getByText('Updating...')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeDisabled()

    // Resolve the promise
    resolvePromise({
      ok: true,
      json: async () => ({ ...mockGoal, pctComplete: 50 })
    })

    await waitFor(() => {
      expect(screen.queryByText('Update Progress')).not.toBeInTheDocument()
    })
  })

  it('should update progress bar preview as user types', async () => {
    const user = userEvent.setup()
    render(<GoalCard goal={mockGoal} />)

    // Open modal
    const progressArea = screen.getByText('Progress').parentElement?.parentElement
    await user.click(progressArea!)

    const input = screen.getByDisplayValue('25')

    // Test different values
    await user.clear(input)
    await user.type(input, '45')
    let previewBar = screen.getByText('Goal: Learn to read').parentElement?.querySelector('.bg-green-500')
    expect(previewBar).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '75')
    previewBar = screen.getByText('Goal: Learn to read').parentElement?.querySelector('.bg-yellow-500')
    expect(previewBar).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, '100')
    previewBar = screen.getByText('Goal: Learn to read').parentElement?.querySelector('.bg-purple-500')
    expect(previewBar).toBeInTheDocument()
  })
}) 