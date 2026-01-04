"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Award, Home, ShoppingBag, LogOut, User, Upload, Wallet, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export function CustomerLayout({ children }: CustomerLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [customerName, setCustomerName] = useState("");
  const [customerPoints, setCustomerPoints] = useState(0);
  const [promotionCount, setPromotionCount] = useState(0);

  useEffect(() => {
    const name = localStorage.getItem("customer_name");
    const points = parseInt(localStorage.getItem("customer_points") || "0");
    setCustomerName(name || "");
    setCustomerPoints(points);

    // Load promotion count
    const loadPromotionCount = async () => {
      try {
        const { getActivePromotionsCount } = await import("@/app/actions/promotions");
        const count = await getActivePromotionsCount();
        setPromotionCount(count);
      } catch (error) {
        console.error("Error loading promotion count:", error);
      }
    };
    loadPromotionCount();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("line_user_id");
    localStorage.removeItem("customer_id");
    localStorage.removeItem("customer_name");
    localStorage.removeItem("customer_points");
    localStorage.removeItem("customer_picture");
    router.push("/customer/login");
  };

  const menuItems = [
    { href: "/customer/dashboard", label: "หน้าหลัก", icon: Home },
    { href: "/customer/store", label: "ร้านรางวัล", icon: Award },
    { href: "/customer/promotions", label: "โปรโมชั่น", icon: Megaphone, badge: promotionCount > 0 ? promotionCount : undefined },
    { href: "/customer/upload-slip", label: "อัปโหลดสลิป", icon: Upload },
    { href: "/customer/history", label: "ประวัติ", icon: ShoppingBag },
    { href: "/customer/demo-wallet", label: "Demo Wallet", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-[#f9f9f9] max-w-md mx-auto md:hidden">
      {/* Desktop Warning */}
      <div className="hidden md:flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">แอปพลิเคชันนี้สำหรับมือถือเท่านั้น</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              กรุณาเปิดแอปพลิเคชันนี้บนมือถือหรือแท็บเล็ตเพื่อใช้งาน
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              กลับไปหน้า Admin
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {/* Header */}
        <header className="bg-white border-b border-[#e4e4e4] sticky top-0 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/customer/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src="/asset/Group 23.png" 
                    alt="6CAT Point Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-semibold text-base text-[#1c1d1d]">6CAT Point</span>
              </Link>

              <div className="flex items-center gap-2">
                {customerName && (
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-medium text-[#1c1d1d] truncate max-w-[100px]">
                        {customerName}
                      </p>
                      <p className="text-xs text-[#00D084] font-semibold">
                        {customerPoints.toLocaleString()} แต้ม
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-muted-foreground p-2"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e4e4e4] z-50 max-w-md mx-auto shadow-lg">
          <div className="grid grid-cols-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center py-3 transition-colors relative",
                    isActive
                      ? "text-[#00D084] bg-green-50"
                      : "text-[#727272]"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5 mb-1" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-tight text-center px-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

