import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Tabs } from './Tabs';

const tabs = [
  { key: 'a', label: 'Tab A' },
  { key: 'b', label: 'Tab B' },
];

describe('Tabs', () => {
  it('renders all tabs', () => {
    render(<Tabs tabs={tabs} active="a" onChange={() => {}} />);
    expect(screen.getByText('Tab A')).toBeInTheDocument();
    expect(screen.getByText('Tab B')).toBeInTheDocument();
  });

  it('applies active class to selected tab', () => {
    render(<Tabs tabs={tabs} active="a" onChange={() => {}} />);
    expect(screen.getByText('Tab A')).toHaveClass('bg-green-600');
    expect(screen.getByText('Tab B')).toHaveClass('bg-gray-100');
  });

  it('calls onChange when tab clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="a" onChange={onChange} />);
    await user.click(screen.getByText('Tab B'));
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('applies custom color', () => {
    render(<Tabs tabs={tabs} active="a" onChange={() => {}} color="red" />);
    expect(screen.getByText('Tab A')).toHaveClass('bg-red-600');
  });
});
