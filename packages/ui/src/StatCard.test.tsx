import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StatCard, StatGrid } from './StatCard';

describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard value={42} label="Orders" />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Orders')).toBeInTheDocument();
  });

  it('applies custom color to value', () => {
    render(<StatCard value="$100" label="Rev" color="#16a34a" />);
    expect(screen.getByText('$100')).toHaveStyle({ color: '#16a34a' });
  });
});

describe('StatGrid', () => {
  it('renders children in a grid', () => {
    const { container } = render(
      <StatGrid cols={3}>
        <StatCard value={1} label="A" />
        <StatCard value={2} label="B" />
        <StatCard value={3} label="C" />
      </StatGrid>
    );
    expect(container.firstChild).toHaveClass('grid-cols-3');
  });
});
