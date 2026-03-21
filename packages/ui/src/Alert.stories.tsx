import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from './Alert';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: { variant: { control: 'select', options: ['error', 'success'] } },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: { children: 'Invalid email or password.' },
};
export const Success: Story = {
  args: { children: 'Profile saved successfully!', variant: 'success' },
};
