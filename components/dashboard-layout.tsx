"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Users, ShoppingBag, Award, Home, UserCircle, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/admin/customers", label: "สมาชิก", icon: UserCircle },
    { href: "/admin/rewards", label: "รางวัล", icon: Gift },
    { href: "/admin/collect-points", label: "เพิ่มแต้ม", icon: Users },
    { href: "/admin/redemptions", label: "รายการแลก", icon: ShoppingBag },
    { href: "/store", label: "ร้านรางวัล", icon: Award },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#e4e4e4] h-[65px] flex items-center justify-between px-4 md:px-6 sticky top-0 z-50 flex-shrink-0">
        <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-8 h-8 bg-[#ff4b00] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CRM</span>
            </div>
            <span className="font-semibold text-lg md:text-xl tracking-wider text-[#1c1d1d] hidden sm:inline">Loyalty Point</span>
          </Link>

          {/* Search Bar */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md">
            <div className="border border-[#ff4b00] rounded-md flex items-center justify-between px-3 py-2 w-full max-w-[334px]">
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#ff4b00] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="text-sm text-[#afafaf]">ค้นหา</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-[rgba(255,75,0,0.06)] rounded px-2 py-1 text-xs text-[#ff4b00]">⌘K</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-8 h-8 rounded-lg border border-[#e7eae9] flex items-center justify-center hover:bg-gray-50 cursor-pointer flex-shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
          
          <div className="hidden md:flex w-8 h-8 rounded-lg border border-[#e7eae9] items-center justify-center hover:bg-gray-50 cursor-pointer flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
            <span className="text-sm font-medium text-[#1c1d1d] hidden sm:inline">Admin</span>
            <svg className="w-4 h-4 text-[#1c1d1d] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#f9f9f9] border-b border-[#e4e4e4]">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-[#ff4b00] text-white"
                      : "text-[#727272] hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:block w-[223px] bg-[#f9f9f9] border-r border-[#e4e4e4] sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto flex-shrink-0">
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== "/" && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-[#ff4b00] text-white"
                      : "text-[#727272] hover:bg-gray-100"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-[calc(100vh-65px)] overflow-y-auto bg-[#f9f9f9]">
          {children}
        </main>
      </div>
    </div>
  );
}

