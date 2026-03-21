import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { FilterPills } from './FilterPills';

const options = [
  { key: 'all', label: 'All' },
  { key: 'a', label: 'Option A', color: '#ff0000' },
  { key: 'b', label: 'Option B', color: '#0000ff' },
];

describe('FilterPills', () => {
  it('renders all options', () => {
    render(<FilterPills options={options} active="all" onChange={() => {}} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });

  it('calls onChange with key when clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterPills options={options} active="all" onChange={onChange} />);
    await user.click(screen.getByText('Option A'));
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('applies active color to selected pill', () => {
    render(<FilterPills options={options} active="a" onChange={() => {}} />);
    expect(screen.getByText('Option A')).toHaveStyle({ background: '#ff0000', color: '#fff' });
  });

  it('applies inactive style to non-selected pills', () => {
    render(<FilterPills options={options} active="a" onChange={() => {}} />);
    expect(screen.getByText('Option B')).toHaveStyle({ background: '#f3f4f6' });
  });
});
