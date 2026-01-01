"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRewards } from "@/app/actions/rewards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerLayout } from "@/components/customer-layout";
import { CustomerRedeemButton } from "@/components/customer-redeem-button";
import { Award } from "lucide-react";
import { findProfileByLineUserId } from "@/app/actions/profiles";

export default function CustomerStorePage() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const lineUserId = localStorage.getItem("line_user_id");
    if (!lineUserId) {
      router.push("/customer/login");
      return;
    }

    const loadData = async () => {
      try {
        // Load customer data
        const customerResult = await findProfileByLineUserId(lineUserId);
        if (customerResult.success && customerResult.data) {
          setCustomer(customerResult.data);
          localStorage.setItem("customer_points", customerResult.data.total_points?.toString() || "0");
        } else {
          router.push("/customer/login");
          return;
        }

        // Load rewards
        const rewardsData = await getRewards();
        setRewards(rewardsData);
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

  const RewardCard = ({ reward }: { reward: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {reward.image_url && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={reward.image_url}
            alt={reward.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{reward.title}</CardTitle>
          <div className="flex items-center gap-1 text-[#ff4b00] font-semibold">
            <Award className="h-4 w-4" />
            <span>{reward.points_required}</span>
          </div>
        </div>
        {reward.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {reward.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            สต็อก:{" "}
            <span
              className={
                reward.stock === 0
                  ? "text-red-500 font-semibold"
                  : "font-semibold"
              }
            >
              {reward.stock}
            </span>
          </div>
          {customer.total_points < reward.points_required && (
            <p className="text-xs text-red-500 font-semibold">แต้มไม่พอ</p>
          )}
        </div>
        <CustomerRedeemButton reward={reward} />
      </CardContent>
    </Card>
  );

  return (
    <CustomerLayout>
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            ร้านรางวัล
          </h1>
          <p className="text-[#85878d]">
            เลือกรางวัลที่คุณต้องการแลกด้วยแต้มสะสม
          </p>
        </div>

        {/* Points Display */}
        <Card className="mb-6 border-2 border-[#ff4b00] bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">แต้มสะสมของคุณ</p>
                <p className="text-3xl font-bold text-[#ff4b00]">
                  {customer.total_points?.toLocaleString() || 0} แต้ม
                </p>
              </div>
              <div className="w-16 h-16 bg-[#ff4b00] rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rewards Grid */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-[#ff4b00] rounded-full"></div>
            <h2 className="text-xl font-bold text-[#211c37]">
              รางวัลทั้งหมด ({rewards.length})
            </h2>
          </div>

          {rewards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                ยังไม่มีรางวัลให้แลก
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <RewardCard key={reward.id} reward={reward} />
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

