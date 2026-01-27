import type { Meta, StoryObj } from '@storybook/react';
import { NovuInbox } from './NovuInbox';

const meta: Meta<typeof NovuInbox> = {
    title: 'Components/NovuInbox',
    component: NovuInbox,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NovuInbox>;

export const Default: Story = {
    args: {},
};
