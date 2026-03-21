import type { Meta, StoryObj } from '@storybook/react';
import { Table, Th, Td } from './Table';

export default { title: 'Components/Table', tags: ['autodocs'] } satisfies Meta;

export const Default: StoryObj = {
  render: () => (
    <Table>
      <thead><tr><Th>ID</Th><Th>Name</Th><Th>Price</Th></tr></thead>
      <tbody>
        <tr><Td>1</Td><Td>Whey Protein</Td><Td>$29.99</Td></tr>
        <tr><Td>2</Td><Td>Multivitamin</Td><Td>$14.99</Td></tr>
      </tbody>
    </Table>
  ),
};
