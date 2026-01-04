"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Send, CheckCircle } from "lucide-react";

function TestWebhookContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState("100");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Auto-fill from URL params
  useEffect(() => {
    const orderIdParam = searchParams.get("orderId");
    const transactionIdParam = searchParams.get("transactionId");
    const amountParam = searchParams.get("amount");

    if (orderIdParam) setOrderId(orderIdParam);
    if (transactionIdParam) setTransactionId(transactionIdParam);
    if (amountParam) setAmount(amountParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSendWebhook = async () => {
    if (!orderId.trim() || !transactionId.trim()) {
      toast({
        title: "กรุณากรอก Order ID และ Transaction ID",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      const timestamp = new Date().toISOString();
      const payload = {
        event: "payment.success",
        transactionId: transactionId.trim(),
        amount: parseFloat(amount),
        currency: "THB",
        timestamp,
        metadata: {
          orderId: orderId.trim(),
        },
      };

      const response = await fetch("/api/demo/webhook/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-promptpay-signature": "test_signature", // Demo mode accepts this
          "x-promptpay-timestamp": timestamp,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      setResult({
        status: response.status,
        success: data.success,
        message: data.message,
        payload,
      });

      if (data.success) {
        toast({
          title: "ส่ง Webhook สำเร็จ",
          description: data.message,
        });
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      setResult({
        status: "error",
        success: false,
        message: error.message,
      });
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่ง Webhook ได้",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1d1d] mb-2">
            ทดสอบ Webhook (Demo)
          </h1>
          <p className="text-sm text-[#6b7280]">
            ใช้หน้านี้เพื่อส่ง Webhook จำลองสำหรับทดสอบระบบ
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>ข้อมูล Webhook</CardTitle>
              <CardDescription>
                กรอกข้อมูลจาก Topup Order ที่สร้างไว้
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID *</Label>
                <Input
                  id="orderId"
                  type="text"
                  placeholder="DEMO-20241215-ABC12"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Order ID จาก Topup Order ที่สร้างไว้
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID *</Label>
                <Input
                  id="transactionId"
                  type="text"
                  placeholder="txn_demo_123456789"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Transaction ID จาก Topup Order (ดูได้ที่หน้า Create Topup)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน (บาท) *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="100"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  ต้องตรงกับจำนวนเงินใน Order
                </p>
              </div>

              <Button
                onClick={handleSendWebhook}
                disabled={isSending || !orderId.trim() || !transactionId.trim()}
                className="w-full bg-[#00D084] hover:bg-[#00D084]/90"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังส่ง...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    ส่ง Webhook
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Result */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>ผลลัพธ์</CardTitle>
              <CardDescription>
                ผลการส่ง Webhook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="py-12 text-center text-muted-foreground">
                  <Send className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>ยังไม่มีการส่ง Webhook</p>
                  <p className="text-sm mt-2">
                    กรอกข้อมูลและกดส่ง Webhook
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    {result.success ? (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-700">
                          สำเร็จ (Status: {result.status})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                        <span className="font-medium text-red-700">
                          ล้มเหลว (Status: {result.status})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-1">ข้อความ:</p>
                    <p className="text-sm text-muted-foreground">
                      {result.message}
                    </p>
                  </div>

                  {/* Payload */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">Payload ที่ส่ง:</p>
                    <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-64">
                      {JSON.stringify(result.payload, null, 2)}
                    </pre>
                  </div>

                  {/* Next Steps */}
                  {result.success && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-2">
                        ✅ Webhook ถูกประมวลผลสำเร็จ
                      </p>
                      <p className="text-xs text-green-600">
                        • ตรวจสอบ Order Status ที่หน้า{" "}
                        <a
                          href="/admin/demo-topup/orders"
                          className="underline font-medium"
                        >
                          Demo Orders
                        </a>
                      </p>
                      <p className="text-xs text-green-600">
                        • ตรวจสอบ Demo Wallet ที่หน้า{" "}
                        <a
                          href="/customer/demo-wallet"
                          className="underline font-medium"
                        >
                          Demo Wallet
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-blue-50 border border-blue-200 mt-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-blue-700 mb-2">
              📝 วิธีใช้งาน:
            </p>
            <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
              <li>ไปที่หน้า{" "}
                <a href="/admin/demo-topup" className="underline font-medium">
                  สร้าง Topup Order
                </a>{" "}
                และสร้าง Order ใหม่
              </li>
              <li>คัดลอก Order ID และ Transaction ID จาก Order ที่สร้าง</li>
              <li>กรอกข้อมูลในฟอร์มด้านบน</li>
              <li>กด &quot;ส่ง Webhook&quot; เพื่อจำลองการชำระเงิน</li>
              <li>ตรวจสอบผลลัพธ์และ Order Status</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function TestWebhookPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="p-4 md:p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </DashboardLayout>
    }>
      <TestWebhookContent />
    </Suspense>
  );
}
