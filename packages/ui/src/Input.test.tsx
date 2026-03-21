import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { Input, Textarea, Select, FormField } from './Input';

describe('Input', () => {
  it('renders an input with placeholder', () => {
    render(<Input placeholder="Name" />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type" />);
    const input = screen.getByPlaceholderText('Type');
    await user.type(input, 'hello');
    expect(input).toHaveValue('hello');
  });
});

describe('Textarea', () => {
  it('renders a textarea', () => {
    render(<Textarea placeholder="Describe" />);
    expect(screen.getByPlaceholderText('Describe').tagName).toBe('TEXTAREA');
  });
});

describe('Select', () => {
  it('renders options', () => {
    render(
      <Select>
        <option value="a">A</option>
        <option value="b">B</option>
      </Select>,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });
});

describe('FormField', () => {
  it('renders label and child', () => {
    render(
      <FormField label="Email" htmlFor="email">
        <Input id="email" />
      </FormField>,
    );
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});
