"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Gift } from "lucide-react";
import { format } from "date-fns";
import { useTenantBrandingCSS } from "@/lib/hooks/use-tenant-branding-css";

interface RecentRedemptionsListProps {
  redemptions: any[];
}

export function RecentRedemptionsList({ redemptions }: RecentRedemptionsListProps) {
  const branding = useTenantBrandingCSS();

  return (
    <Card className="bg-white border-0 shadow-sm mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-[#1c1d1d]">รายการแลกรางวัลล่าสุด</CardTitle>
          <Link href="/admin/redemptions">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-[#6b7280]"
              style={{ 
                "--hover-color": branding.primaryColor 
              } as React.CSSProperties & { "--hover-color": string }}
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
        <div className="space-y-3">
          {redemptions.length === 0 ? (
            <p className="text-center text-[#6b7280] py-8">ยังไม่มีรายการแลกรางวัล</p>
          ) : (
            redemptions.map((redemption: any) => (
              <div
                key={redemption.id}
                className="flex items-center gap-4 p-4 rounded-lg bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors border border-transparent hover:border-[#e5e7eb]"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--brand-light)" }}
                >
                  <Gift className="w-6 h-6" style={{ color: "var(--brand-primary)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1c1d1d] mb-1">
                    {redemption.rewards?.title || "ไม่ระบุ"}
                  </p>
                  <p className="text-sm text-[#6b7280] mb-1">
                    {redemption.profiles?.full_name || "ไม่ระบุ"} ({redemption.profiles?.phone || "-"})
                  </p>
                  <p className="text-xs text-[#9ca3af]">
                    {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-semibold" style={{ color: "var(--brand-primary)" }}>
                      {redemption.rewards?.points_required || 0} แต้ม
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                        redemption.status === "completed"
                          ? "bg-[#d1fae5] text-[#065f46]"
                          : "bg-[#fef3c7] text-[#92400e]"
                      }`}
                    >
                      {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

