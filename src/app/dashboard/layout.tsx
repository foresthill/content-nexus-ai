'use client';

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full -m-10">
      {/* サイドバー */}
      <div className="w-64 flex-shrink-0">
        <Sidebar currentPath={pathname} />
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  );
}