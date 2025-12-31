import { getRewards } from "@/app/actions/rewards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Award } from "lucide-react";
import { RedeemButton } from "@/components/redeem-button";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function StorePage() {
  const rewards = await getRewards();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">ร้านรางวัล</h1>
        <p className="text-muted-foreground">
          เลือกรางวัลที่คุณต้องการแลกด้วยแต้มสะสม
        </p>
      </div>

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            ยังไม่มีรางวัลให้แลก
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                  <CardTitle className="text-xl">{reward.title}</CardTitle>
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Award className="h-4 w-4" />
                    <span>{reward.points_required}</span>
                  </div>
                </div>
                {reward.description && (
                  <CardDescription className="line-clamp-2">
                    {reward.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    สต็อก: <span className={reward.stock === 0 ? "text-red-500 font-semibold" : "font-semibold"}>{reward.stock}</span>
                  </div>
                </div>
                <RedeemButton reward={reward} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}

