import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Table, Th, Td } from './Table';

describe('Table', () => {
  it('renders a table with headers and cells', () => {
    render(
      <Table>
        <thead><tr><Th>Name</Th></tr></thead>
        <tbody><tr><Td>Alice</Td></tr></tbody>
      </Table>
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('Th applies header styling', () => {
    render(<table><thead><tr><Th>H</Th></tr></thead></table>);
    expect(screen.getByText('H')).toHaveClass('font-semibold');
  });

  it('Td applies cell styling', () => {
    render(<table><tbody><tr><Td>C</Td></tr></tbody></table>);
    expect(screen.getByText('C')).toHaveClass('border-b');
  });
});
