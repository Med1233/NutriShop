import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card, CardHeader } from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies default variant', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild).toHaveClass('bg-white');
  });

  it('applies form variant', () => {
    const { container } = render(<Card variant="form">Test</Card>);
    expect(container.firstChild).toHaveClass('bg-gray-50');
  });

  it('merges custom className', () => {
    const { container } = render(<Card className="mt-8">Test</Card>);
    expect(container.firstChild).toHaveClass('mt-8');
  });
});

describe('CardHeader', () => {
  it('renders title', () => {
    render(<CardHeader title="My Title" />);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  it('renders action children', () => {
    render(<CardHeader title="T"><button>Act</button></CardHeader>);
    expect(screen.getByRole('button', { name: 'Act' })).toBeInTheDocument();
  });
});
