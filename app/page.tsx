import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/stats";
import { Gift, Users, ShoppingBag, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const stats = await getDashboardStats();
  const currentDate = format(new Date(), "EEE, d MMM yyyy");

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl font-bold text-[#1c1d1d] mb-1">
                สวัสดี Admin 👋🏻
              </h1>
              <p className="text-[#6b7280] text-sm">
                มาดูสถิติและจัดการระบบแต้มสะสมกันเถอะ
              </p>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-sm text-[#6b7280] hidden sm:block">
                {currentDate}
              </p>
              <Link href="/customer/login" target="_blank">
                <Button className="bg-[#ff4b00] hover:bg-[#ff4b00]/90 text-white gap-2">
                  <Gift className="w-4 h-4" />
                  Customer App
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-[#fff5f0] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#ff4b00]" />
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
                <div className="w-12 h-12 bg-[#fff5f0] rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#ff4b00]" />
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
                <div className="w-12 h-12 bg-[#fff5f0] rounded-xl flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#ff4b00]" />
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
                <div className="w-12 h-12 bg-[#fff5f0] rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#ff4b00]" />
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
                <Button variant="ghost" size="sm" className="text-[#6b7280] hover:text-[#ff4b00]">
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
                    <div className="w-12 h-12 bg-[#fff5f0] rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-[#ff4b00]" />
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
                        <p className="text-sm font-semibold text-[#ff4b00]">
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
                <Button variant="ghost" size="sm" className="text-[#6b7280] hover:text-[#ff4b00]">
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
                    className="bg-[#f9fafb] border border-[#e5e7eb] rounded-xl p-4 hover:shadow-md transition-all hover:border-[#ff4b00]/20"
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
                      <span className="text-xs font-semibold text-[#ff4b00]">
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
