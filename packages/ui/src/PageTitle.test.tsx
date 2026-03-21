import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PageTitle } from './PageTitle';

describe('PageTitle', () => {
  it('renders text', () => {
    render(<PageTitle>Hello</PageTitle>);
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument();
  });

  it('applies color class', () => {
    render(<PageTitle color="red">Admin</PageTitle>);
    expect(screen.getByRole('heading')).toHaveClass('text-red-600');
  });

  it('has no color class by default', () => {
    render(<PageTitle>Default</PageTitle>);
    expect(screen.getByRole('heading')).not.toHaveClass('text-blue-500');
  });
});
