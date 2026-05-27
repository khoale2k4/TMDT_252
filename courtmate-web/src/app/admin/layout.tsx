import { ReactNode } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import TopBar from '@/components/admin/TopBar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 w-full overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
