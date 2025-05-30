import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ActivityDrawer from './ActivityDrawer'

// Mock fetch
global.fetch = vi.fn()

describe('ActivityDrawer', () => {
  const mockOnClose = vi.fn()
  const mockOnActivityAdded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders drawer with form fields', () => {
    render(
      <ActivityDrawer
        goalId="test-goal"
        onClose={mockOnClose}
        onActivityAdded={mockOnActivityAdded}
      />
    )

    expect(screen.getByText('Add Activity')).toBeInTheDocument()
    expect(screen.getByLabelText('Activity Notes *')).toBeInTheDocument()
    expect(screen.getByLabelText('Progress Increase (%) *')).toBeInTheDocument()
    expect(screen.getByText('Save Activity')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ActivityDrawer
        goalId="test-goal"
        onClose={mockOnClose}
        onActivityAdded={mockOnActivityAdded}
      />
    )

    fireEvent.click(screen.getByText('Cancel'))
    expect(mockOnClose).toHaveBeenCalled()
  })

  it('validates form fields', () => {
    render(
      <ActivityDrawer
        goalId="test-goal"
        onClose={mockOnClose}
        onActivityAdded={mockOnActivityAdded}
      />
    )

    const submitButton = screen.getByText('Save Activity')
    fireEvent.click(submitButton)

    expect(screen.getByText('Activity notes are required')).toBeInTheDocument()
    expect(screen.getByText('Progress must be between 1 and 100')).toBeInTheDocument()
  })

  it('accepts valid form inputs', () => {
    render(
      <ActivityDrawer
        goalId="test-goal"
        onClose={mockOnClose}
        onActivityAdded={mockOnActivityAdded}
      />
    )

    const notesInput = screen.getByLabelText('Activity Notes *')
    const deltaInput = screen.getByLabelText('Progress Increase (%) *')

    fireEvent.change(notesInput, { target: { value: 'Test activity' } })
    fireEvent.change(deltaInput, { target: { value: '25' } })

    expect(notesInput).toHaveValue('Test activity')
    expect(deltaInput).toHaveValue(25)
  })
}) 