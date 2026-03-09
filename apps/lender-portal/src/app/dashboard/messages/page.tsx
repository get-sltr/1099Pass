'use client';

import {
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MessagesPage() {
  return (
    <div className="h-[calc(100vh-10rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with borrowers who have shared their income packages
          </p>
        </div>
      </div>

      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-foreground mb-1">No messages yet</p>
          <p className="text-muted-foreground max-w-md">
            Conversations will appear here when you contact borrowers through their income reports, or when borrowers reach out to you.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
