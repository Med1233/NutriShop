import type { Meta, StoryObj } from '@storybook/react';
import { StatCard, StatGrid } from './StatCard';

export default {
  title: 'Components/StatCard',
  component: StatCard,
  tags: ['autodocs'],
} satisfies Meta<typeof StatCard>;

export const Single: StoryObj<typeof StatCard> = {
  args: { value: 42, label: 'Orders' },
};
export const Colored: StoryObj<typeof StatCard> = {
  args: { value: '$1,234', label: 'Revenue', color: '#16a34a' },
};

export const Grid: StoryObj = {
  render: () => (
    <StatGrid cols={3}>
      <StatCard value={120} label="Products" />
      <StatCard value={5} label="Categories" />
      <StatCard value={3} label="Low Stock" color="#ef4444" />
    </StatGrid>
  ),
};
