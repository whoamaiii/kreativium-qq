import { render, screen } from '@testing-library/react';
import Header from './Header';
import { describe, it, expect } from 'vitest';

describe('Header Component', () => {
  it('renders the brand name "Kreativium"', () => {
    render(<Header />);
    const brandElement = screen.getByText(/Kreativium/i);
    expect(brandElement).toBeInTheDocument();
  });

  it('renders a link to the homepage', () => {
    render(<Header />);
    const linkElement = screen.getByRole('link', { name: /Kreativium/i });
    expect(linkElement).toHaveAttribute('href', '/');
  });

  it('renders a placeholder for user avatar', () => {
    render(<Header />);
    // This is a bit brittle, depends on the placeholder text.
    // A better way would be to use a data-testid or a more specific role if possible.
    const avatarPlaceholder = screen.getByText('U'); 
    expect(avatarPlaceholder).toBeInTheDocument();
  });
});
