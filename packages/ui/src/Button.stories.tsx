import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger', 'ghost', 'outline'] },
    size: { control: 'select', options: ['xs', 'sm', 'md'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { children: 'Primary Button', variant: 'primary' } };
export const Secondary: Story = { args: { children: 'Secondary Button', variant: 'secondary' } };
export const Danger: Story = { args: { children: 'Delete', variant: 'danger' } };
export const Ghost: Story = { args: { children: 'Ghost Link', variant: 'ghost' } };
export const Outline: Story = { args: { children: 'Cancel', variant: 'outline' } };
export const ExtraSmall: Story = { args: { children: 'XS', size: 'xs' } };
export const Medium: Story = { args: { children: 'Medium', size: 'md' } };
export const Disabled: Story = { args: { children: 'Disabled', disabled: true } };
