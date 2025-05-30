import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddGoalModal from './AddGoalModal'

// Mock fetch
global.fetch = vi.fn()

describe('AddGoalModal', () => {
  const mockOnClose = vi.fn()
  const mockOnGoalAdded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders modal with form fields', () => {
    render(
      <AddGoalModal
        kidId={1}
        onClose={mockOnClose}
        onGoalAdded={mockOnGoalAdded}
      />
    )

    expect(screen.getByText('Add New Goal')).toBeInTheDocument()
    expect(screen.getByLabelText('Goal Title *')).toBeInTheDocument()
    expect(screen.getByLabelText('Description (optional)')).toBeInTheDocument()
    expect(screen.getByText('Create Goal')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <AddGoalModal
        kidId={1}
        onClose={mockOnClose}
        onGoalAdded={mockOnGoalAdded}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('validates required title field', async () => {
    render(
      <AddGoalModal
        kidId={1}
        onClose={mockOnClose}
        onGoalAdded={mockOnGoalAdded}
      />
    )

    const submitButton = screen.getByText('Create Goal')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when title is provided', () => {
    render(
      <AddGoalModal
        kidId={1}
        onClose={mockOnClose}
        onGoalAdded={mockOnGoalAdded}
      />
    )

    const titleInput = screen.getByLabelText('Goal Title *')
    fireEvent.change(titleInput, { target: { value: 'Test Goal' } })

    const submitButton = screen.getByText('Create Goal')
    expect(submitButton).not.toBeDisabled()
  })
}) 