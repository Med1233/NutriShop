import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { DetailPanel, ToggleButton } from './DetailPanel';

export default {
  title: 'Components/DetailPanel',
  tags: ['autodocs'],
} satisfies Meta;

export const WithToggle: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div>
        <ToggleButton expanded={open} onClick={() => setOpen(!open)}>
          Details
        </ToggleButton>
        {open && (
          <DetailPanel>
            <p>Shipping to: 123 Main St</p>
            <p>Item 1 x2 — $29.99</p>
          </DetailPanel>
        )}
      </div>
    );
  },
};

export const BlueToggle: StoryObj = {
  render: () => {
    const [open, setOpen] = useState(true);
    return (
      <div>
        <ToggleButton
          expanded={open}
          onClick={() => setOpen(!open)}
          color="blue"
        >
          Order Items
        </ToggleButton>
        {open && (
          <DetailPanel>
            <p>Content here</p>
          </DetailPanel>
        )}
      </div>
    );
  },
};
