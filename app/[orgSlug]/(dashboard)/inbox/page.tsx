'use client';

import { Bell, MessageSquare } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl h-full flex flex-col items-center justify-center text-center">
       <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
          <Bell className="w-10 h-10 text-secondary" />
       </div>
       <h1 className="text-3xl font-bold text-primary mb-2">Inbox</h1>
       <p className="text-foreground-muted max-w-md">
           Notifications and messages from your team will appear here.
           Currently, please check <strong>Approvals</strong> for pending expense requests.
       </p>
    </div>
  );
}
