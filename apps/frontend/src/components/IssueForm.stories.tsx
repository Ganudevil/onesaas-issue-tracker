import type { Meta, StoryObj } from '@storybook/react';
import { IssueForm } from './IssueForm';

const meta: Meta<typeof IssueForm> = {
    title: 'Components/IssueForm',
    component: IssueForm,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssueForm>;

export const Default: Story = {
    args: {},
};
