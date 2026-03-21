import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge, CategoryBadge, StatusBadge, ProviderBadge } from './Badge';

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Label</Badge>);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('applies inline color styles', () => {
    render(
      <Badge color="#ff0000" bgColor="#ff000020">
        Red
      </Badge>,
    );
    const el = screen.getByText('Red');
    expect(el).toHaveStyle({ color: '#ff0000', background: '#ff000020' });
  });
});

describe('CategoryBadge', () => {
  it('renders label with uppercase', () => {
    render(
      <CategoryBadge
        category="proteins"
        label="Proteins"
        colors={{ proteins: '#2563eb' }}
      />,
    );
    expect(screen.getByText('Proteins')).toHaveClass('uppercase');
  });
});

describe('StatusBadge', () => {
  it('renders label with capitalize', () => {
    render(
      <StatusBadge
        status="pending"
        label="Pending"
        colors={{ pending: '#f59e0b' }}
      />,
    );
    expect(screen.getByText('Pending')).toHaveClass('capitalize');
  });
});

describe('ProviderBadge', () => {
  it('renders provider name', () => {
    render(<ProviderBadge provider="google" />);
    expect(screen.getByText('google')).toHaveClass('uppercase');
  });
});
