import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader } from './Card';
import { Button } from './Button';

const meta = {
  title: 'Components/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'form', 'muted'] },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'Default card content' } };
export const Form: Story = {
  args: { children: 'Form card content', variant: 'form' },
};
export const Muted: Story = {
  args: { children: 'Muted card content', variant: 'muted' },
};

export const WithHeader: StoryObj = {
  render: () => (
    <Card>
      <CardHeader title="Section Title">
        <Button size="xs">Action</Button>
      </CardHeader>
      <p>Card body content goes here.</p>
    </Card>
  ),
};
