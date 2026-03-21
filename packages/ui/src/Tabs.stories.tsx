import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Tabs } from './Tabs';

export default {
  title: 'Components/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

const tabs = [
  { key: 'products', label: 'Products' },
  { key: 'users', label: 'Users' },
  { key: 'orders', label: 'Orders' },
];

export const Green: StoryObj = {
  render: () => {
    const [a, s] = useState('products');
    return <Tabs tabs={tabs} active={a} onChange={s} />;
  },
};

export const Red: StoryObj = {
  render: () => {
    const [a, s] = useState('products');
    return <Tabs tabs={tabs} active={a} onChange={s} color="red" />;
  },
};
