"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Info, User, ShieldCheck, LogOut, FileText } from "lucide-react";
import { ReactNode, useState, useEffect, useRef } from "react";
import Button from "./Button";

type NavItem = {
  href: string;
  title: string;
  label: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    href: "/search",
    title: "Sân thể thao",
    label: "Sân thể thao",
    icon: <MapPin className="w-4 h-4 shrink-0" />
  },
  {
    href: "/about",
    title: "Về chúng tôi",
    label: "Về chúng tôi",
    icon: <Info className="w-4 h-4 shrink-0" />
  }
];

const navLinkBaseClasses =
  "flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-medium underline-offset-4 decoration-2 transition-all duration-300 active:scale-95 sm:rounded-none sm:px-2.5 sm:text-sm";

const activeNavLinkClasses =
  "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 sm:bg-transparent sm:dark:bg-transparent sm:underline";

const inactiveNavLinkClasses =
  "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-blue-950/30 sm:hover:bg-transparent sm:dark:hover:bg-transparent sm:hover:underline";

export default function NavBar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role");
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role || null);
    } else {
      setIsLoggedIn(false);
      setUserRole(null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("active_venue_id");
    setIsLoggedIn(false);
    setUserRole(null);
    window.location.href = "/";
  };

  if (pathname === '/login' || pathname === '/register' || pathname.startsWith('/admin')) return null; 
  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[95%] max-w-7xl z-50">
      <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-yellow-500 rounded-full blur-xl opacity-20 dark:opacity-30 pointer-events-none" />

      <nav className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl ring-1 ring-slate-900/5 dark:ring-white/10 rounded-full flex justify-between items-center px-3 sm:px-5 md:px-8 py-2 sm:py-3">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12">
            <img
              src="/courtmate_favicon.png"
              alt="CourtMate Logo"
              className="w-full h-full object-contain drop-shadow-md"
            />
          </div>
          <span className="hidden md:block text-xl lg:text-2xl font-bold italic tracking-tighter bg-linear-to-r from-blue-600 to-yellow-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-yellow-400  pr-1">
            CourtMate
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-3 md:gap-6">
          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-6">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  aria-current={active ? "page" : undefined}
                  className={`${navLinkBaseClasses} ${active ? activeNavLinkClasses : inactiveNavLinkClasses}`}
                >
                  {item.icon}
                  <span className="hidden sm:inline whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isLoggedIn ? (
              <Link href="/login">
                <Button
                  title="Đăng nhập"
                  variant="secondary"
                  className="gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span className="hidden sm:inline">Đăng nhập</span>
                </Button>
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <Button
                  title="Tài khoản"
                  variant="secondary"
                  className="gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    U
                  </div>
                  <span className="hidden sm:inline">Tài khoản</span>
                </Button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 overflow-hidden z-50">
                    <Link 
                      href="/history" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FileText className="w-4 h-4" />
                      Lịch sử đặt sân
                    </Link>
                    <Link 
                      href="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User className="w-4 h-4" />
                      Hồ sơ cá nhân
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}


            {(userRole === 'owner' || userRole === 'admin') && (
              <Link href="/admin/dashboard">
                <Button variant="primary" className="hidden sm:flex px-4 py-2 text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Admin</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}