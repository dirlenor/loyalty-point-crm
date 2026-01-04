import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/stats";
import { Gift, Users, ShoppingBag, TrendingUp, Megaphone } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PromotionCarousel } from "@/components/promotion-carousel";

export default async function HomePage() {
  const stats = await getDashboardStats();

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Promotions Carousel */}
        {stats.activePromotions.length > 0 && (
          <Card className="bg-white border-0 shadow-sm mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[green-50] rounded-lg flex items-center justify-center">
                    <Megaphone className="w-5 h-5 text-[#00D084]" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-[#1c1d1d]">โปรโมชั่น</CardTitle>
                </div>
                <Link href="/admin/promotions">
                  <Button variant="ghost" size="sm" className="text-[#6b7280] hover:text-[#00D084]">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <PromotionCarousel promotions={stats.activePromotions} />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#00D084]" />
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
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#00D084]" />
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
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#00D084]" />
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
                <div className="w-12 h-12 bg-[green-50] rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#00D084]" />
                </div>
              </div>
              <div>
                <p className="text-sm text-[#6b7280] mb-1">รางวัลทั้งหมด</p>
                <p className="text-3xl font-bold text-[#1c1d1d]">{stats.totalRewards}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Redemptions */}
        <Card className="bg-white border-0 shadow-sm mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1c1d1d]">รายการแลกรางวัลล่าสุด</CardTitle>
              <Link href="/admin/redemptions">
                <Button variant="ghost" size="sm" className="text-[#6b7280] hover:text-[#00D084]">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentRedemptions.length === 0 ? (
                <p className="text-center text-[#6b7280] py-8">ยังไม่มีรายการแลกรางวัล</p>
              ) : (
                stats.recentRedemptions.map((redemption: any) => (
                  <div
                    key={redemption.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-[#f9fafb] hover:bg-[#f3f4f6] transition-colors border border-transparent hover:border-[#e5e7eb]"
                  >
                    <div className="w-12 h-12 bg-[green-50] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-[#00D084]" />
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
                        <p className="text-sm font-semibold text-[#00D084]">
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

        {/* Recent Rewards */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1c1d1d]">รางวัลล่าสุด</CardTitle>
              <Link href="/admin/rewards">
                <Button variant="ghost" size="sm" className="text-[#6b7280] hover:text-[#00D084]">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.recentRewards.length === 0 ? (
                <p className="col-span-full text-center text-[#6b7280] py-8">
                  ยังไม่มีรางวัล
                </p>
              ) : (
                stats.recentRewards.map((reward: any) => (
                  <div
                    key={reward.id}
                    className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 hover:shadow-md transition-all hover:border-[#00D084]/20"
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
                      <span className="text-xs font-semibold text-[#00D084]">
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
      </div>
    </DashboardLayout>
  );
}
