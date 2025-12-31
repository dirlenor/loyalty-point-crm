import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/app/actions/stats";
import { Gift, Users, ShoppingBag, Award, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { DashboardLayout } from "@/components/dashboard-layout";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const stats = await getDashboardStats();

  return (
    <DashboardLayout>
      <div className="p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#211c37] mb-2">
            สวัสดี Admin 👋🏻
          </h1>
          <p className="text-[#85878d] text-lg">
            มาดูสถิติและจัดการระบบแต้มสะสมกันเถอะ!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">ลูกค้าทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#1c1d1d]">{stats.totalCustomers}</div>
                <div className="w-12 h-12 bg-[rgba(28,29,29,0.05)] rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#1c1d1d]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">แต้มทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#1c1d1d]">{stats.totalPoints.toLocaleString()}</div>
                <div className="w-12 h-12 bg-[rgba(255,75,0,0.1)] rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-[#ff4b00]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">การแลกรางวัล</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#1c1d1d]">{stats.totalRedemptions}</div>
                <div className="w-12 h-12 bg-[rgba(28,29,29,0.05)] rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-[#1c1d1d]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4e4e4] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.09)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-[#1c1d1d]">รางวัลทั้งหมด</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-[#1c1d1d]">{stats.totalRewards}</div>
                <div className="w-12 h-12 bg-[rgba(28,29,29,0.05)] rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-[#1c1d1d]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Recent Redemptions */}
            <Card className="border border-[#e2e8f0] shadow-[0px_3.389px_5.084px_0px_rgba(0,0,0,0.09)]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-[#1c1d1d]">รายการแลกรางวัลล่าสุด</CardTitle>
                <Link href="/admin/redemptions">
                  <Button variant="ghost" size="sm" className="text-[#1c1d1d]">
                    ดูทั้งหมด
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentRedemptions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">ยังไม่มีรายการแลกรางวัล</p>
                ) : (
                  stats.recentRedemptions.map((redemption: any) => (
                    <div
                      key={redemption.id}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        redemption.status === "pending"
                          ? "bg-white border border-[#ff4b00]"
                          : "bg-white border border-[#e4e4e4]"
                      }`}
                    >
                      <div className="w-10 h-10 bg-[rgba(28,29,29,0.05)] rounded-lg flex items-center justify-center">
                        <Gift className="w-5 h-5 text-[#1c1d1d]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#1c1d1d]">
                          {redemption.rewards?.title || "ไม่ระบุ"}
                        </p>
                        <p className="text-sm text-[#85878d]">
                          {redemption.profiles?.full_name || "ไม่ระบุ"} ({redemption.profiles?.phone || "-"})
                        </p>
                        <p className="text-xs text-[#85878d] mt-1">
                          {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#ff4b00]">
                          {redemption.rewards?.points_required || 0} แต้ม
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            redemption.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Rewards */}
        <Card className="border border-[#e2e8f0] shadow-[0px_3.389px_5.084px_0px_rgba(0,0,0,0.09)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium text-[#1c1d1d]">รางวัลล่าสุด</CardTitle>
              <Link href="/admin/rewards">
                <Button variant="ghost" size="sm" className="text-[#1c1d1d]">
                  ดูทั้งหมด
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stats.recentRewards.length === 0 ? (
                <p className="col-span-full text-center text-muted-foreground py-8">
                  ยังไม่มีรางวัล
                </p>
              ) : (
                stats.recentRewards.map((reward: any) => (
                  <div
                    key={reward.id}
                    className="bg-white border border-[#e4e4e4] rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    {reward.image_url && (
                      <div className="aspect-video w-full mb-3 rounded overflow-hidden bg-gray-100">
                        <img
                          src={reward.image_url}
                          alt={reward.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-semibold text-sm text-[#1c1d1d] mb-1 line-clamp-2">
                      {reward.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#ff4b00] font-semibold">
                        {reward.points_required} แต้ม
                      </span>
                      <span
                        className={`text-xs ${
                          reward.stock === 0 ? "text-red-500" : "text-[#85878d]"
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
