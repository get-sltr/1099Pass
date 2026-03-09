'use client';

import Link from 'next/link';
import {
  FileText,
  Users,
  MessageSquare,
  Eye,
  ArrowRight,
  Inbox,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const stats = [
  {
    title: 'New Reports',
    value: '0',
    subtitle: 'This week',
    icon: FileText,
  },
  {
    title: 'Reports Viewed',
    value: '0',
    subtitle: 'This week',
    icon: Eye,
  },
  {
    title: 'Borrowers Contacted',
    value: '0',
    subtitle: 'This week',
    icon: Users,
  },
  {
    title: 'Pending Messages',
    value: '0',
    subtitle: 'Awaiting response',
    icon: MessageSquare,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold font-mono mt-1">{stat.value}</p>
                    <span className="text-xs text-muted-foreground">
                      {stat.subtitle}
                    </span>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Borrower Reports</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/reports">
              View all <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No borrower reports yet. Reports will appear here when borrowers share their income packages with you.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
