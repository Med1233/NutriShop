import type { Meta, StoryObj } from '@storybook/react';
import { PageTitle } from './PageTitle';

const meta = {
  title: 'Components/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
  argTypes: {
    color: {
      control: 'select',
      options: ['default', 'blue', 'red', 'violet', 'green'],
    },
  },
} satisfies Meta<typeof PageTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Shopping Cart' } };
export const Blue: Story = {
  args: { children: 'Order Management', color: 'blue' },
};
export const Red: Story = { args: { children: 'Admin Panel', color: 'red' } };
export const Violet: Story = {
  args: { children: 'Stock Management', color: 'violet' },
};
