import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('renders as an anchor by default', () => {
    render(<LinkButton href="/test">Link</LinkButton>);
    const el = screen.getByText('Link');
    expect(el.tagName).toBe('A');
    expect(el).toHaveAttribute('href', '/test');
  });

  it('applies primary variant by default', () => {
    render(<LinkButton href="#">Go</LinkButton>);
    expect(screen.getByText('Go')).toHaveClass('bg-green-600');
  });

  it('applies outline variant', () => {
    render(<LinkButton href="#" variant="outline">Outline</LinkButton>);
    expect(screen.getByText('Outline')).toHaveClass('border-green-600');
  });

  it('accepts a custom component via as prop', () => {
    function CustomLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
      return <a data-testid="custom" {...props} />;
    }
    render(<LinkButton as={CustomLink} href="/x">Custom</LinkButton>);
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });

  it('merges custom className', () => {
    render(<LinkButton href="#" className="mt-4">Styled</LinkButton>);
    expect(screen.getByText('Styled')).toHaveClass('mt-4');
  });
});
