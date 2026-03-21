import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DetailPanel, ToggleButton } from './DetailPanel';

describe('DetailPanel', () => {
  it('renders children', () => {
    render(<DetailPanel>Content</DetailPanel>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('has muted background', () => {
    const { container } = render(<DetailPanel>X</DetailPanel>);
    expect(container.firstChild).toHaveClass('bg-gray-50');
  });
});

describe('ToggleButton', () => {
  it('shows down arrow when collapsed', () => {
    render(
      <ToggleButton expanded={false} onClick={() => {}}>
        Details
      </ToggleButton>,
    );
    expect(screen.getByText(/Details/)).toHaveTextContent('\u25BC');
  });

  it('shows up arrow when expanded', () => {
    render(
      <ToggleButton expanded={true} onClick={() => {}}>
        Details
      </ToggleButton>,
    );
    expect(screen.getByText(/Details/)).toHaveTextContent('\u25B2');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ToggleButton expanded={false} onClick={onClick}>
        Toggle
      </ToggleButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('applies color class', () => {
    render(
      <ToggleButton expanded={false} onClick={() => {}} color="blue">
        D
      </ToggleButton>,
    );
    expect(screen.getByRole('button')).toHaveClass('text-blue-500');
  });
});
