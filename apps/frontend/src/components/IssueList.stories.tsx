import type { Meta, StoryObj } from '@storybook/react';
import IssueList from './IssueList';

const meta: Meta<typeof IssueList> = {
    title: 'Components/IssueList',
    component: IssueList,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssueList>;

export const Default: Story = {
    args: {},
    parameters: {
        // Mock user session
        auth: {
            isAuthenticated: true,
            user: { name: 'Test User' },
        },
    },
};
