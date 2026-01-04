"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { verifyRedemptionCode } from "@/app/actions/redemptions";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, QrCode, Loader2, Search } from "lucide-react";
import { format } from "date-fns";

export default function VerifyRedemptionPage() {
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      toast({
        title: "กรุณากรอกรหัส 6 ตัวอักษร",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      // Add RD- prefix
      const fullCode = `RD-${code.trim().toUpperCase()}`;
      const result = await verifyRedemptionCode(fullCode);

      if (result.success) {
        setVerificationResult(result.data);
        toast({
          title: "ยืนยันสำเร็จ",
          description: result.message,
        });
        // Clear code after successful verification
        setCode("");
      } else {
        setVerificationResult(null);
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถยืนยันรหัสได้",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1d1d] mb-2">
            ยืนยันการรับรางวัล
          </h1>
          <p className="text-sm text-[#6b7280]">
            สแกน QR Code หรือกรอกรหัสเพื่อยืนยันการรับรางวัล
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>กรอกรหัสรับรางวัล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">รหัสรับรางวัล</Label>
                <div className="flex gap-2">
                  <div className="flex items-center border border-input rounded-md bg-background flex-1">
                    <span className="px-3 py-2 text-lg font-mono text-muted-foreground border-r border-input">
                      RD-
                    </span>
                    <Input
                      id="code"
                      type="text"
                      placeholder="XXXXXX"
                      value={code}
                      onChange={(e) => {
                        // Only allow alphanumeric, max 6 characters
                        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
                        setCode(value);
                      }}
                      onKeyPress={handleKeyPress}
                      className="font-mono text-lg tracking-wider border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoFocus
                    />
                  </div>
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || !code.trim() || code.length !== 6}
                    className="bg-[#00D084] hover:bg-[#00D084]/90"
                  >
                    {isVerifying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  กด Enter เพื่อยืนยัน (กรอก 6 ตัวอักษร)
                </p>
              </div>

              {/* QR Code Scanner Placeholder */}
              <div className="pt-4 border-t">
                <Label>สแกน QR Code</Label>
                <div className="mt-2 p-4 border-2 border-dashed rounded-lg text-center">
                  <QrCode className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    ฟีเจอร์สแกน QR Code กำลังพัฒนา
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    กรุณาใช้การกรอกรหัสแทน
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Result Section */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle>ผลการยืนยัน</CardTitle>
            </CardHeader>
            <CardContent>
              {!verificationResult ? (
                <div className="py-12 text-center text-muted-foreground">
                  <QrCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>ยังไม่มีการยืนยัน</p>
                  <p className="text-sm mt-2">
                    กรอกรหัสหรือสแกน QR Code เพื่อยืนยัน
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    {verificationResult.status === "completed" ? (
                      <Badge className="bg-green-500 text-white px-4 py-2 text-base">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        ยืนยันสำเร็จ
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500 text-white px-4 py-2 text-base">
                        <XCircle className="w-4 h-4 mr-2" />
                        รอดำเนินการ
                      </Badge>
                    )}
                  </div>

                  {/* Customer Info */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                    <p className="font-medium text-sm mb-2">ข้อมูลลูกค้า</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">ชื่อ: </span>
                        <span className="font-medium">
                          {verificationResult.profiles?.full_name || "ไม่ระบุ"}
                        </span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">เบอร์โทร: </span>
                        <span className="font-medium">
                          {verificationResult.profiles?.phone || "ไม่ระบุ"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Reward Info */}
                  <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                    <p className="font-medium text-sm mb-2">รางวัล</p>
                    <p className="text-sm font-medium">
                      {verificationResult.rewards?.title || "ไม่ระบุ"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ใช้แต้ม: {verificationResult.rewards?.points_required || 0} แต้ม
                    </p>
                  </div>

                  {/* Redemption Code */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">รหัสรับรางวัล</p>
                    <p className="text-2xl font-mono font-bold text-[#00D084]">
                      {verificationResult.redemption_code}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-muted-foreground text-center">
                    แลกเมื่อ:{" "}
                    {format(
                      new Date(verificationResult.created_at),
                      "dd/MM/yyyy HH:mm"
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

