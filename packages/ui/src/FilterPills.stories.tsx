import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { FilterPills } from './FilterPills';

export default { title: 'Components/FilterPills', component: FilterPills, tags: ['autodocs'] } satisfies Meta<typeof FilterPills>;

const options = [
  { key: 'all', label: 'All (12)', color: '#16a34a' },
  { key: 'proteins', label: 'Proteins', color: '#2563eb' },
  { key: 'vitamins', label: 'Vitamins', color: '#f59e0b' },
  { key: 'snacks', label: 'Snacks', color: '#ef4444' },
];

export const Interactive: StoryObj = {
  render: () => {
    const [active, setActive] = useState('all');
    return <FilterPills options={options} active={active} onChange={setActive} />;
  },
};
