"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerLayout } from "@/components/customer-layout";
import { Award, Gift, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { findProfileByPhone } from "@/app/actions/profiles";
import { getRewards } from "@/app/actions/rewards";
import { getCustomerRedemptions } from "@/app/actions/customer-redemptions";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function CustomerDashboardPage() {
  const [customer, setCustomer] = useState<any>(null);
  const [rewards, setRewards] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const phone = localStorage.getItem("customer_phone");
    if (!phone) {
      router.push("/customer/login");
      return;
    }

    const loadData = async () => {
      try {
        const result = await findProfileByPhone(phone);
        if (result.success && result.data) {
          setCustomer(result.data);
          localStorage.setItem("customer_points", result.data.total_points?.toString() || "0");
          
          // Load rewards
          const rewardsData = await getRewards();
          setRewards(rewardsData);
          
          // Load redemptions
          const redemptionsData = await getCustomerRedemptions(result.data.id);
          setRedemptions(redemptionsData);
        } else {
          router.push("/customer/login");
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>กำลังโหลด...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="p-4">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            สวัสดี {customer.full_name} 👋🏻
          </h1>
          <p className="text-[#85878d]">
            ยินดีต้อนรับสู่ระบบ 6CAT Point
          </p>
        </div>

        {/* Points Card */}
        <Card className="mb-6 border-2 border-[#ff4b00] shadow-lg bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-6 h-6 text-[#ff4b00]" />
              แต้มสะสมของคุณ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-[#ff4b00] mb-2">
                {customer.total_points?.toLocaleString() || 0}
              </div>
              <p className="text-lg text-muted-foreground">แต้ม</p>
            </div>
          </CardContent>
        </Card>

        {/* Available Rewards - รางวัลที่สามารถแลกได้ */}
        {(() => {
          const availableRewards = rewards.filter(
            (reward) =>
              customer.total_points >= reward.points_required && reward.stock > 0
          );

          return availableRewards.length > 0 ? (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-[#ff4b00] rounded-full"></div>
                  <h2 className="text-xl font-bold text-[#211c37]">
                    รางวัลที่สามารถแลกได้ ({availableRewards.length})
                  </h2>
                </div>
                <Link href="/customer/store">
                  <Button variant="ghost" size="sm" className="text-[#ff4b00]">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {availableRewards.slice(0, 4).map((reward) => (
                  <Link key={reward.id} href="/customer/store">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-[#ff4b00]">
                      {reward.image_url && (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={reward.image_url}
                            alt={reward.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm text-[#1c1d1d] mb-1 line-clamp-1">
                          {reward.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#ff4b00] font-semibold">
                            {reward.points_required} แต้ม
                          </span>
                          <span className="text-xs text-green-600 font-semibold">
                            สต็อก: {reward.stock}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Redemption History List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-[#211c37]">
                ประวัติการแลก
              </h2>
            </div>
            {redemptions.length > 5 && (
              <Link href="/customer/history">
                <Button variant="ghost" size="sm" className="text-blue-600">
                  ดูทั้งหมด
                </Button>
              </Link>
            )}
          </div>
          
          {redemptions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                ยังไม่มีประวัติการแลกรางวัล
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {redemptions.slice(0, 5).map((redemption: any) => (
                <div
                  key={redemption.id}
                  className="bg-white border border-[#e4e4e4] rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {redemption.rewards?.image_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={redemption.rewards.image_url}
                          alt={redemption.rewards.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Gift className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-sm text-[#1c1d1d] truncate">
                          {redemption.rewards?.title || "ไม่ระบุ"}
                        </h3>
                        <Badge
                          variant="outline"
                          className={
                            redemption.status === "completed"
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                          }
                        >
                          {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                        </span>
                        <span>•</span>
                        <span className="text-[#ff4b00] font-semibold">
                          {redemption.rewards?.points_required || 0} แต้ม
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1">วิธีใช้แต้ม</p>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>เลือกสินค้าที่ต้องการแลก</li>
                  <li>ตรวจสอบแต้มที่ต้องใช้</li>
                  <li>กดปุ่มแลกรางวัล</li>
                  <li>รอการอนุมัติจากแอดมิน</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}

