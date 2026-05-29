'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Sparkles, Receipt, LogOut } from 'lucide-react';

const sidebarItems = [
  { href: '/admin/dashboard', title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/admin/venues', title: 'Slot Grid', icon: <CalendarDays className="w-5 h-5" /> },
  { href: '/admin/pricing-rules', title: 'AI Pricing', icon: <Sparkles className="w-5 h-5" /> },
  { href: '/admin/invoices', title: 'Invoices', icon: <Receipt className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("active_venue_id");
    window.location.href = "/";
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-8 h-8">
            <img
              src="/courtmate_favicon.png"
              alt="CourtMate Logo"
              className="w-full h-full object-contain drop-shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-700 dark:text-blue-500 leading-tight">
              CourtMate
            </span>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-tight">
              Admin Dashboard
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          // Adjust active state logic if we have sub-routes
          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                {item.icon}
              </div>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
