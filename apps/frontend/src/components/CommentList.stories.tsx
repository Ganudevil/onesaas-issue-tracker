import type { Meta, StoryObj } from '@storybook/react';
import CommentList from './CommentList';

const meta: Meta<typeof CommentList> = {
    title: 'Components/CommentList',
    component: CommentList,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CommentList>;

const mockComments = [
    {
        id: '1',
        text: 'This is a test comment',
        createdBy: 'user-1',
        createdAt: new Date().toISOString(),
        issueId: 'issue-1',
    },
    {
        id: '2',
        text: 'Another comment',
        createdBy: 'user-2',
        createdAt: new Date().toISOString(),
        issueId: 'issue-1',
    },
];

export const Default: Story = {
    args: {
        issueId: 'issue-1',
    },
    parameters: {
        mockData: mockComments,
    },
};
