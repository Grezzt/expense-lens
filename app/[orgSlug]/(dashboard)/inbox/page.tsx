'use client';

import { Bell } from 'lucide-react';

export default function InboxPage() {
  return (
    <div className="mx-auto px-6 py-10 h-full flex flex-col items-center justify-center text-center" style={{ maxWidth: 1400 }}>
       <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 animate-pulse"
        style={{
            backgroundColor: 'rgba(191,216,82,0.1)',
            border: '1px solid rgba(191,216,82,0.3)',
        }}
       >
          <Bell className="w-10 h-10" style={{ color: 'var(--el-accent)' }} />
       </div>
       <h1 className="font-bold mb-2" style={{ fontSize: 'clamp(24px, 3vw, 36px)', color: 'var(--el-primary)', lineHeight: 1.1 }}>
           Inbox
       </h1>
       <p className="max-w-md text-sm" style={{ color: 'var(--el-primary)', opacity: 0.6, lineHeight: 1.6 }}>
           Notifications and messages from your team will appear here.<br/>
           Currently, please check <strong style={{ color: 'var(--el-primary)', opacity: 1 }}>Approvals</strong> for pending expense requests.
       </p>
    </div>
  );
}
