"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gift, Users, ShoppingBag, Award, Home, UserCircle, Menu, X, History, FileCheck, ScanLine, QrCode, Wallet, ChevronDown, ChevronRight, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getPendingSlipCount } from "@/app/actions/slip-submissions";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingSlipCount, setPendingSlipCount] = useState(0);
  const [topupMenuOpen, setTopupMenuOpen] = useState(false);

  useEffect(() => {
    const loadPendingCount = async () => {
      const count = await getPendingSlipCount();
      setPendingSlipCount(count);
    };
    loadPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(loadPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/admin/customers", label: "สมาชิก", icon: UserCircle },
    { href: "/admin/rewards", label: "รางวัลทั้งหมด", icon: Gift },
    { href: "/admin/redemptions", label: "รายการแลก", icon: ShoppingBag },
    { href: "/admin/verify-redemption", label: "ยืนยันรับรางวัล", icon: ScanLine },
    { href: "/admin/slip-review", label: "ตรวจสอบสลิป", icon: FileCheck, badge: true },
    { href: "/admin/history", label: "ประวัติทั้งหมด", icon: History },
    { href: "/store", label: "ร้านรางวัล", icon: Award },
  ];

  // Topup submenu items
  const topupSubmenuItems = [
    { href: "/admin/demo-topup", label: "Demo Topup", icon: QrCode },
    { href: "/admin/demo-topup/orders", label: "Demo Orders", icon: ListOrdered },
    { href: "/admin/demo-topup/test-webhook", label: "Test Webhook", icon: QrCode },
  ];

  // Check if any topup submenu is active
  const isTopupMenuActive = pathname?.startsWith("/admin/demo-topup");
  
  // Auto-open topup menu if on a topup page
  useEffect(() => {
    if (isTopupMenuActive) {
      setTopupMenuOpen(true);
    }
  }, [isTopupMenuActive]);

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-[#e5e7eb] flex-shrink-0 fixed left-0 top-0 h-screen">
        {/* Logo Section */}
        <div className="p-6 border-b border-[#e5e7eb] flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ff4b00] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">6</span>
            </div>
            <span className="font-bold text-xl text-[#1c1d1d]">6CAT Point</span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Check if current path matches exactly or is a child path
            let isActive = pathname === item.href;
            
            // For non-root paths, check if it's a child path
            if (!isActive && item.href !== "/") {
              isActive = pathname?.startsWith(item.href + "/") || pathname === item.href;
            }
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-[#ff4b00] text-white shadow-sm"
                    : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#1c1d1d]"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && pendingSlipCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingSlipCount > 9 ? "9+" : pendingSlipCount}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Topup Menu with Dropdown */}
          <div className="mt-1">
            <button
              onClick={() => setTopupMenuOpen(!topupMenuOpen)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isTopupMenuActive
                  ? "bg-[#ff4b00] text-white shadow-sm"
                  : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#1c1d1d]"
              )}
            >
              <Wallet className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium flex-1 text-left">ระบบ Topup</span>
              {topupMenuOpen ? (
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              )}
            </button>
            
            {/* Submenu */}
            {topupMenuOpen && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#e5e7eb] pl-2">
                {topupSubmenuItems.map((subItem) => {
                  const SubIcon = subItem.icon;
                  const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + "/");
                  
                  return (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm",
                        isSubActive
                          ? "bg-[#ff4b00] text-white shadow-sm"
                          : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#1c1d1d]"
                      )}
                    >
                      <SubIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="font-medium">{subItem.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[260px]">
        {/* Header */}
        <header className="bg-white border-b border-[#e5e7eb] h-[70px] flex items-center justify-between px-6 sticky top-0 z-50 flex-shrink-0">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification */}
            <button className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer relative">
              <svg className="w-5 h-5 text-[#6b7280]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            
            {/* Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-[#e5e7eb]">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0"></div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-[#1c1d1d]">Admin</p>
                <p className="text-xs text-[#6b7280]">Administrator</p>
              </div>
              <svg className="w-4 h-4 text-[#6b7280] hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#e5e7eb]">
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                let isActive = pathname === item.href;
                
                if (!isActive && item.href !== "/") {
                  isActive = pathname?.startsWith(item.href + "/") || pathname === item.href;
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                      isActive
                        ? "bg-[#ff4b00] text-white"
                        : "text-[#6b7280] hover:bg-[#f9fafb]"
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && pendingSlipCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {pendingSlipCount > 9 ? "9+" : pendingSlipCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Topup Menu for Mobile */}
              <div className="mt-1">
                <button
                  onClick={() => setTopupMenuOpen(!topupMenuOpen)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isTopupMenuActive
                      ? "bg-[#ff4b00] text-white"
                      : "text-[#6b7280] hover:bg-[#f9fafb]"
                  )}
                >
                  <Wallet className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium flex-1 text-left">ระบบ Topup</span>
                  {topupMenuOpen ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>
                
                {topupMenuOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#e5e7eb] pl-2">
                    {topupSubmenuItems.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + "/");
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm",
                            isSubActive
                              ? "bg-[#ff4b00] text-white"
                              : "text-[#6b7280] hover:bg-[#f9fafb]"
                          )}
                        >
                          <SubIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#f5f7fa]">
          {children}
        </main>
      </div>
    </div>
  );
}
