'use client';

import { useState } from 'react';
import { Camera } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useRouter } from 'next/navigation';

export default function SmartScanButton() {
  const { canAccessRoute } = usePermissions();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // Only show for users who can create expenses
  if (!canAccessRoute(['owner', 'admin', 'accountant', 'member'])) {
    return null;
  }

  const handleClick = () => {
    // Navigate to scan/upload page (to be created)
    router.push('/expenses/scan');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-30 flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
    >
      <Camera className="w-6 h-6" />
      <span className={`font-semibold transition-all ${isHovered ? 'max-w-32' : 'max-w-0'} overflow-hidden whitespace-nowrap`}>
        Scan Receipt
      </span>
    </button>
  );
}
