import type { Meta, StoryObj } from '@storybook/react';
import { IssueDetail } from './IssueDetail';

const meta: Meta<typeof IssueDetail> = {
    title: 'Components/IssueDetail',
    component: IssueDetail,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof IssueDetail>;

export const Default: Story = {
    args: {
        issueId: '1',
    },
};
