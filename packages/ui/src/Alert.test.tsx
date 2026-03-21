import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  it('renders message', () => {
    render(<Alert>Error occurred</Alert>);
    expect(screen.getByRole('alert')).toHaveTextContent('Error occurred');
  });

  it('applies error variant by default', () => {
    render(<Alert>Err</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50', 'text-red-600');
  });

  it('applies success variant', () => {
    render(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole('alert')).toHaveClass('bg-green-50', 'text-green-600');
  });
});
