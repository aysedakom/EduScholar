import { ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ApplicationStatus } from '../../types';

const applications: {
  id: string;
  program: string;
  status: ApplicationStatus;
  amount?: number;
  updatedAt: string;
}[] = [];

const statusLabel: Record<string, string> = {
  approved: 'Approved',
  Approved: 'Approved',
  pending: 'Pending',
  action_required: 'Under Review',
  rejected: 'Rejected',
  Rejected: 'Rejected',
  Submitted: 'Submitted',
  'Under Review': 'Under Review',
  'Interview Scheduled': 'Interview Scheduled',
  'Renewal Processing': 'Renewal Processing',
  Draft: 'Draft',
  Paid: 'Paid',
};

const statusVariant: Record<string, 'success' | 'warning' | 'info' | 'destructive'> = {
  approved: 'success',
  Approved: 'success',
  pending: 'info',
  action_required: 'warning',
  rejected: 'destructive',
  Rejected: 'destructive',
  Submitted: 'info',
  'Under Review': 'warning',
  'Interview Scheduled': 'info',
  'Renewal Processing': 'info',
  Draft: 'warning',
  Paid: 'success',
};

export function RecentApplications() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Recent Applications</CardTitle>
          <CardDescription>Your latest scholarship and educational grant activity</CardDescription>
        </div>
        <button className="text-xs font-semibold text-primary hover:underline">View all</button>
      </CardHeader>
      <div className="divide-y divide-border">
        {applications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-medium">
            No recent applications found.
          </div>
        ) : (
          applications.map((app) => (
            <div key={app.id} className="flex items-center gap-4 p-4 md:p-5">
              <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-xs font-bold text-muted-foreground sm:flex">
                {app.program.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{app.program}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {app.id} • Updated {app.updatedAt}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[app.status] || 'info'}>
                  {statusLabel[app.status] || app.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
