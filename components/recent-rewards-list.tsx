"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useTenantBrandingCSS } from "@/lib/hooks/use-tenant-branding-css";

interface RecentRewardsListProps {
  rewards: any[];
}

export function RecentRewardsList({ rewards }: RecentRewardsListProps) {
  const branding = useTenantBrandingCSS();

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#1c1d1d]">รางวัลล่าสุด</CardTitle>
          <Link href="/admin/rewards">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#6b7280]"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--brand-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6b7280";
              }}
            >
              ดูทั้งหมด
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {rewards.length === 0 ? (
            <p className="col-span-full text-center text-[#6b7280] py-8">
              ยังไม่มีรางวัล
            </p>
          ) : (
            rewards.map((reward: any) => (
              <div
                key={reward.id}
                className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 hover:shadow-md transition-all"
                style={{
                  borderColor: "#e5e7eb"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--brand-primary)33";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                {reward.image_url && (
                  <div className="aspect-video w-full mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={reward.image_url}
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-semibold text-sm text-[#1c1d1d] mb-2 line-clamp-2">
                  {reward.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: "var(--brand-primary)" }}>
                    {reward.points_required} แต้ม
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      reward.stock === 0 ? "text-red-500" : "text-[#6b7280]"
                    }`}
                  >
                    สต็อก: {reward.stock}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

