'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Inbox,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ReportDetailClient({ reportId }: { reportId: string }) {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground mb-1">Report {reportId} not available</p>
            <p className="text-muted-foreground max-w-md">
              This report has not been shared with you yet, or it does not exist. Borrower reports will be viewable here once shared.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => router.push('/dashboard/reports')}>
              Back to Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
