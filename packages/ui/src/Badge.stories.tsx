import type { Meta, StoryObj } from '@storybook/react';
import { Badge, CategoryBadge, StatusBadge, ProviderBadge } from './Badge';

export default { title: 'Components/Badge', tags: ['autodocs'] } satisfies Meta;

const colors = { proteins: '#2563eb', vitamins: '#f59e0b', pending: '#f59e0b', delivered: '#16a34a' };

export const Default: StoryObj = { render: () => <Badge color="#2563eb" bgColor="#2563eb20">Label</Badge> };
export const Category: StoryObj = { render: () => <CategoryBadge category="proteins" label="Proteins" colors={colors} /> };
export const Status: StoryObj = { render: () => <StatusBadge status="delivered" label="Delivered" colors={colors} /> };
export const Provider: StoryObj = { render: () => <ProviderBadge provider="google" /> };
