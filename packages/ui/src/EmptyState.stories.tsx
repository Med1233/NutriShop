import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;

export const WithAction: StoryObj<typeof meta> = {
  args: {
    message: 'Your cart is empty.',
    actionLabel: 'Continue Shopping',
    actionHref: '#',
  },
};

export const WithoutAction: StoryObj<typeof meta> = {
  args: { message: 'No orders found.' },
};
