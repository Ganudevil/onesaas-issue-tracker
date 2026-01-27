import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardHeader, CardTitle, CardContent } from './Card';

const meta: Meta<typeof Card> = {
    title: 'UI/Card',
    component: Card,
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
    render: () => (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Card Content area. You can put anything here.</p>
            </CardContent>
        </Card>
    ),
};
