import type { Meta, StoryObj } from '@storybook/react';
import { LinkButton } from './LinkButton';

const meta = {
  title: 'Components/LinkButton',
  component: LinkButton,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'outline', 'ghost'] },
  },
} satisfies Meta<typeof LinkButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Go to Shop', href: '#' } };
export const Outline: Story = { args: { children: 'View Cart', href: '#', variant: 'outline' } };
export const Ghost: Story = { args: { children: 'Continue Shopping', href: '#', variant: 'ghost' } };
