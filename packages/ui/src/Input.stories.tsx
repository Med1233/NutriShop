import type { Meta, StoryObj } from '@storybook/react';
import { Input, Textarea, Select, FormField } from './Input';

export default {
  title: 'Components/Input',
  tags: ['autodocs'],
} satisfies Meta;

export const TextInput: StoryObj = {
  render: () => <Input placeholder="Enter your name..." />,
};

export const TextareaExample: StoryObj = {
  render: () => <Textarea placeholder="Write a description..." rows={3} />,
};

export const SelectExample: StoryObj = {
  render: () => (
    <Select>
      <option>Proteins</option>
      <option>Vitamins</option>
      <option>Supplements</option>
    </Select>
  ),
};

export const FieldWithLabel: StoryObj = {
  render: () => (
    <FormField label="Email" htmlFor="email">
      <Input id="email" type="email" placeholder="you@example.com" />
    </FormField>
  ),
};
