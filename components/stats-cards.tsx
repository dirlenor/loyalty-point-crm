"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Gift, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { useTenantBrandingCSS } from "@/lib/hooks/use-tenant-branding-css";

interface StatsCardsProps {
  stats: {
    totalCustomers: number;
    totalPoints: number;
    totalRedemptions: number;
    totalRewards: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  const branding = useTenantBrandingCSS();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "var(--brand-light)" }}
            >
              <Users className="w-6 h-6" style={{ color: "var(--brand-primary)" }} />
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-1">ลูกค้าทั้งหมด</p>
            <p className="text-3xl font-bold text-[#1c1d1d]">{stats.totalCustomers}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: branding.lightColor || "#fff5f0" }}
            >
              <TrendingUp className="w-6 h-6" style={{ color: branding.primaryColor }} />
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-1">แต้มทั้งหมด</p>
            <p className="text-3xl font-bold text-[#1c1d1d]">{stats.totalPoints.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: branding.lightColor || "#fff5f0" }}
            >
              <ShoppingBag className="w-6 h-6" style={{ color: branding.primaryColor }} />
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-1">การแลกรางวัล</p>
            <p className="text-3xl font-bold text-[#1c1d1d]">{stats.totalRedemptions}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: branding.lightColor || "#fff5f0" }}
            >
              <Gift className="w-6 h-6" style={{ color: branding.primaryColor }} />
            </div>
          </div>
          <div>
            <p className="text-sm text-[#6b7280] mb-1">รางวัลทั้งหมด</p>
            <p className="text-3xl font-bold text-[#1c1d1d]">{stats.totalRewards}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

