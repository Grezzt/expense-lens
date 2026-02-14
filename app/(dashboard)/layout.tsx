import Sidebar from '@/components/navigation/Sidebar';
import SmartScanButton from '@/components/navigation/SmartScanButton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#F1F1F1' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      {/* Floating Scan Button */}
      <SmartScanButton />
    </div>
  );
}
