"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/customer-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DemoQrDisplay } from "@/components/demo-qr-display";
import { findProfileByLineUserId } from "@/app/actions/profiles";
import { Loader2, QrCode, ArrowLeft } from "lucide-react";

interface TopupResponse {
  orderId: string;
  amount: number;
  pointsToAdd: number;
  qrCodeUrl: string;
  qrCodeData: string;
  expiresAt: string;
  transactionId: string;
}

export default function CustomerDemoTopupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [topupData, setTopupData] = useState<TopupResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      const lineUserId = localStorage.getItem("line_user_id");
      if (!lineUserId) {
        router.push("/customer/login");
        return;
      }

      try {
        const customerResult = await findProfileByLineUserId(lineUserId);
        if (customerResult.success && customerResult.data) {
          setCustomer(customerResult.data);
        } else {
          router.push("/customer/login");
        }
      } catch (error) {
        console.error("Error loading customer:", error);
        router.push("/customer/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomer();
  }, [router]);

  const handleCreateTopup = async () => {
    if (!customer) return;

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
          userId: customer.id,
          amount: amountNum,
          phone: customer.phone,
          fullName: customer.full_name,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTopupData(result.data);
        toast({
          title: "สร้าง Order สำเร็จ",
          description: `กรุณาสแกน QR Code เพื่อเติมเงิน`,
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
      <div className="p-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/customer/demo-wallet")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            กลับ
          </Button>
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            เติมเงิน (Demo)
          </h1>
          <p className="text-[#85878d]">
            สร้าง QR Code เพื่อเติมเงินเข้าบัญชี Demo
          </p>
        </div>

        {!topupData ? (
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>จำนวนเงินที่ต้องการเติม</CardTitle>
              <CardDescription>
                ระบบจะสร้าง QR Code สำหรับชำระเงิน (1 บาท = 1 แต้ม)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
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
                  จำนวนเงินที่ต้องการเติม (ขั้นต่ำ 1 บาท)
                </p>
              </div>

              {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">แต้มที่จะได้รับ:</span>
                    <span className="text-lg font-bold text-green-600">
                      {Math.floor(parseFloat(amount)).toLocaleString()} แต้ม
                    </span>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateTopup}
                disabled={isCreating || !amount || parseFloat(amount) <= 0}
                className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90"
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
        ) : (
          <div className="space-y-4">
            <DemoQrDisplay
              orderId={topupData.orderId}
              amount={topupData.amount}
              pointsToAdd={topupData.pointsToAdd}
              qrCodeData={topupData.qrCodeData}
              qrCodeUrl={topupData.qrCodeUrl}
              expiresAt={topupData.expiresAt}
              transactionId={topupData.transactionId}
            />

            <Button
              variant="outline"
              onClick={() => {
                setTopupData(null);
                setAmount("");
              }}
              className="w-full"
            >
              สร้าง Order ใหม่
            </Button>
          </div>
        )}

        {/* Demo Notice */}
        <Card className="bg-blue-50 border border-blue-200 mt-4">
          <CardContent className="p-4">
            <p className="text-xs text-blue-700 text-center">
              <strong>หมายเหตุ:</strong> นี่คือระบบ Demo สำหรับทดสอบ
              <br />
              การชำระเงินจะไม่ถูกเรียกเก็บจริง
            </p>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}

