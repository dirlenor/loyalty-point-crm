"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Plus, History, Loader2 } from "lucide-react";
import { findProfileByLineUserId } from "@/app/actions/profiles";
import { getDemoWallet, getDemoWalletHistory } from "@/app/actions/demo-wallet";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function CustomerDemoWalletPage() {
  const { toast } = useToast();
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const lineUserId = localStorage.getItem("line_user_id");
      if (!lineUserId) {
        router.push("/customer/login");
        return;
      }

      try {
        // Get customer profile
        const customerResult = await findProfileByLineUserId(lineUserId);
        if (!customerResult.success || !customerResult.data) {
          router.push("/customer/login");
          return;
        }

        // Get demo wallet using profile_id
        let walletResult = await getDemoWallet(customerResult.data.id);
        
        // If not found, try to find or create demo user
        if (!walletResult.success || !walletResult.data) {
          console.log("Demo wallet not found, creating demo user...");
          // Try to find or create demo user
          const { findOrCreateDemoUser } = await import("@/app/actions/demo-topup");
          const demoUserResult = await findOrCreateDemoUser(
            customerResult.data.id,
            customerResult.data.phone,
            customerResult.data.full_name
          );
          
          if (demoUserResult.success && demoUserResult.data) {
            console.log("Demo user created/found, fetching wallet again...");
            // Try again with profile_id (not demo user id)
            walletResult = await getDemoWallet(customerResult.data.id);
          }
        }
        
        if (walletResult.success && walletResult.data) {
          console.log("Wallet loaded:", walletResult.data);
          setWallet(walletResult.data);
        } else {
          console.error("Failed to get demo wallet:", walletResult);
          // Show error message to user
          const errorMessage = "message" in walletResult ? walletResult.message : "กรุณาสร้าง Topup Order ก่อน";
          toast({
            title: "ไม่พบ Demo Wallet",
            description: errorMessage,
            variant: "destructive",
          });
        }

        // Get history
        const historyResult = await getDemoWalletHistory(customerResult.data.id);
        if (historyResult.success) {
          setHistory(historyResult.data);
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
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="p-4 relative">
        {/* Beta Watermark */}
        <div className="absolute top-4 right-4 z-10">
          <Badge 
            variant="outline" 
            className="bg-yellow-100/80 text-yellow-700 border-yellow-300 text-xs font-semibold opacity-60"
          >
            BETA
          </Badge>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            Demo Wallet
          </h1>
          <p className="text-[#85878d]">
            ดูยอดแต้มในระบบ Demo (ไม่ใช่แต้มจริง)
          </p>
        </div>

        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-[#00D084] to-[#ff6b2b] text-white mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">ยอดแต้ม Demo</p>
                <p className="text-4xl font-bold">
                  {wallet?.balance?.toLocaleString() || 0}
                </p>
                <p className="text-sm opacity-75 mt-2">
                  แต้มทั้งหมดที่ได้รับ: {wallet?.totalPointsEarned?.toLocaleString() || 0}
                </p>
              </div>
              <Wallet className="w-16 h-16 opacity-20" />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">จำนวน Topup</p>
              <p className="text-2xl font-bold text-[#1c1d1d]">
                {wallet?.totalTopups || 0}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-1">แต้มสะสม</p>
              <p className="text-2xl font-bold text-green-600">
                {wallet?.totalPointsEarned?.toLocaleString() || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => router.push("/customer/demo-topup")}
            className="flex-1 bg-[#00D084] hover:bg-[#00D084]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            เติมเงิน
          </Button>
        </div>

        {/* Transaction History */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              ประวัติการทำรายการ
            </CardTitle>
            <CardDescription>
              รายการเปลี่ยนแปลงแต้มทั้งหมด
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                ยังไม่มีประวัติการทำรายการ
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((entry: any) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {entry.transaction_type === "topup"
                            ? "เติมเงิน"
                            : entry.transaction_type === "redeem"
                            ? "แลกรางวัล"
                            : "ปรับปรุง"}
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            entry.points_change > 0
                              ? "bg-green-50 text-green-700 border-green-200 text-xs"
                              : "bg-red-50 text-red-700 border-red-200 text-xs"
                          }
                        >
                          {entry.points_change > 0 ? "+" : ""}
                          {entry.points_change.toLocaleString()}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {entry.description || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(entry.created_at), "dd/MM/yyyy HH:mm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1c1d1d]">
                        {entry.balance_after.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">แต้มคงเหลือ</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <Card className="bg-blue-50 border border-blue-200 mt-4">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 text-center">
              <strong>หมายเหตุ:</strong> นี่คือระบบ Demo สำหรับทดสอบ
              <br />
              แต้มในระบบนี้ไม่ใช่แต้มจริงและไม่สามารถใช้แลกรางวัลได้
            </p>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}

