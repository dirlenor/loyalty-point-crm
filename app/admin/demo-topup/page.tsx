"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DemoQrDisplay } from "@/components/demo-qr-display";
import { Loader2, QrCode } from "lucide-react";

interface TopupResponse {
  orderId: string;
  amount: number;
  pointsToAdd: number;
  qrCodeUrl: string;
  qrCodeData: string;
  expiresAt: string;
  transactionId: string;
}

export default function AdminDemoTopupPage() {
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [topupData, setTopupData] = useState<TopupResponse | null>(null);

  const handleCreateTopup = async () => {
    if (!userId.trim()) {
      toast({
        title: "กรุณากรอก User ID",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/demo/topup/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount: amountNum,
          phone: phone.trim() || undefined,
          fullName: fullName.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTopupData(result.data);
        toast({
          title: "สร้าง Order สำเร็จ",
          description: `Order ID: ${result.data.orderId}`,
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถสร้าง Order ได้",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1d1d] mb-2">
            สร้าง Topup Order (Demo)
          </h1>
          <p className="text-sm text-[#6b7280]">
            สร้าง PromptPay QR Code สำหรับทดสอบการเติมเงิน
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Create Form */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>ข้อมูล Topup</CardTitle>
              <CardDescription>
                กรอกข้อมูลเพื่อสร้าง QR Code สำหรับชำระเงิน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  type="text"
                  placeholder="UUID หรือ Profile ID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ใช้ Profile ID จากระบบ CRM หรือ UUID ของ demo user
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน (บาท) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  min="1"
                  max="100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  จำนวนเงินที่ต้องการเติม (1 บาท = 1 แต้ม)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์ (Optional)</Label>
                <Input
                  id="phone"
                  type="text"
                  placeholder="0812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  สำหรับสร้าง demo user ใหม่ (ถ้ายังไม่มี)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">ชื่อ-นามสกุล (Optional)</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="ชื่อลูกค้า"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCreateTopup}
                disabled={isCreating || !userId.trim() || !amount}
                className="w-full bg-[#00D084] hover:bg-[#00D084]/90"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังสร้าง...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 mr-2" />
                    สร้าง QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* QR Display */}
          <div>
            {topupData ? (
              <DemoQrDisplay
                orderId={topupData.orderId}
                amount={topupData.amount}
                pointsToAdd={topupData.pointsToAdd}
                qrCodeData={topupData.qrCodeData}
                qrCodeUrl={topupData.qrCodeUrl}
                expiresAt={topupData.expiresAt}
                transactionId={topupData.transactionId}
              />
            ) : (
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>ยังไม่มีการสร้าง Order</p>
                  <p className="text-sm mt-2">
                    กรอกข้อมูลและกดสร้าง QR Code
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

