import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StarsBadge from './StarsBadge';

describe('StarsBadge Component', () => {
  describe('Basic rendering', () => {
    it('renders with zero stars', () => {
      render(<StarsBadge stars={0} />);
      expect(screen.getByText('0 stars')).toBeInTheDocument();
      expect(screen.getByText('☆')).toBeInTheDocument(); // Empty star
    });

    it('renders with one star (singular)', () => {
      render(<StarsBadge stars={1} />);
      expect(screen.getByText('1 star')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('renders with multiple stars (plural)', () => {
      render(<StarsBadge stars={5} />);
      expect(screen.getByText('5 stars')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('renders small size', () => {
      render(<StarsBadge stars={3} size="sm" />);
      const badge = screen.getByText('3 stars').closest('div');
      expect(badge).toHaveClass('px-2', 'py-1', 'text-xs');
    });

    it('renders medium size (default)', () => {
      render(<StarsBadge stars={3} size="md" />);
      const badge = screen.getByText('3 stars').closest('div');
      expect(badge).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    it('renders large size', () => {
      render(<StarsBadge stars={3} size="lg" />);
      const badge = screen.getByText('3 stars').closest('div');
      expect(badge).toHaveClass('px-4', 'py-3', 'text-base');
    });
  });

  describe('Variants', () => {
    it('renders default variant', () => {
      render(<StarsBadge stars={3} variant="default" />);
      expect(screen.getByText('3 stars')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('renders compact variant', () => {
      render(<StarsBadge stars={3} variant="compact" />);
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
      // Should not show the word "stars" in compact mode
      expect(screen.queryByText('3 stars')).not.toBeInTheDocument();
    });

    it('renders detailed variant with singular star', () => {
      render(<StarsBadge stars={1} variant="detailed" />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('star earned')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });

    it('renders detailed variant with plural stars', () => {
      render(<StarsBadge stars={5} variant="detailed" />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('stars earned')).toBeInTheDocument();
      expect(screen.getByText('⭐')).toBeInTheDocument();
    });
  });

  describe('Star count styling', () => {
    it('applies correct styling for zero stars', () => {
      render(<StarsBadge stars={0} />);
      const badge = screen.getByText('0 stars').closest('div');
      expect(badge).toHaveClass('bg-slate-700/50', 'border-slate-600', 'text-slate-400');
    });

    it('applies correct styling for low star count (1-4)', () => {
      render(<StarsBadge stars={3} />);
      const badge = screen.getByText('3 stars').closest('div');
      expect(badge).toHaveClass('bg-yellow-900/30', 'border-yellow-600/50', 'text-yellow-400');
    });

    it('applies correct styling for medium star count (5-9)', () => {
      render(<StarsBadge stars={7} />);
      const badge = screen.getByText('7 stars').closest('div');
      expect(badge).toHaveClass('bg-orange-900/30', 'border-orange-600/50', 'text-orange-400');
    });

    it('applies correct styling for high star count (10+)', () => {
      render(<StarsBadge stars={15} />);
      const badge = screen.getByText('15 stars').closest('div');
      expect(badge).toHaveClass('bg-purple-900/30', 'border-purple-600/50', 'text-purple-400');
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(<StarsBadge stars={3} className="custom-class" />);
      const badge = screen.getByText('3 stars').closest('div');
      expect(badge).toHaveClass('custom-class');
    });
  });

  describe('Accessibility', () => {
    it('has proper text content for screen readers', () => {
      render(<StarsBadge stars={5} />);
      expect(screen.getByText('5 stars')).toBeInTheDocument();
    });

    it('handles zero stars appropriately', () => {
      render(<StarsBadge stars={0} />);
      expect(screen.getByText('0 stars')).toBeInTheDocument();
    });
  });
}); 