import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    render(<EmptyState message="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders action link when provided', () => {
    render(<EmptyState message="Empty" actionLabel="Shop" actionHref="/shop" />);
    expect(screen.getByText('Shop')).toHaveAttribute('href', '/shop');
  });

  it('does not render action when not provided', () => {
    render(<EmptyState message="Empty" />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
