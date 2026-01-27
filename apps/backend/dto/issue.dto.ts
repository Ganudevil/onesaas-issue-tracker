export class CreateIssueDto {
  title: string;
  description: string;
  status?: 'open' | 'in_progress' | 'closed';
  createdBy: string;
  assignedTo?: string;
}

export class UpdateIssueDto {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'closed';
  assignedTo?: string;
}
