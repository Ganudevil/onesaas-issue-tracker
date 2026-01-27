import type { Meta, StoryObj } from '@storybook/react';
import { IssueCard } from './IssueCard';
import { IssueStatus, IssuePriority } from '../../types';

const meta: Meta<typeof IssueCard> = {
    title: 'Components/IssueCard',
    component: IssueCard,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssueCard>;

const mockIssue = {
    id: '1',
    title: 'Fix login page layout',
    description: 'The login page is not responsive on mobile devices.',
    status: IssueStatus.OPEN,
    priority: IssuePriority.HIGH,
    createdBy: 'user-1',
    assignedTo: 'user-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tenantId: 'tenant-1',
};

const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    role: 'admin',
};

export const Default: Story = {
    args: {
        issue: mockIssue,
        createdUser: mockUser,
        assignedUser: { ...mockUser, id: 'user-2', displayName: 'Jane Doe' },
    },
};
