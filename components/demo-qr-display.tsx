"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface DemoQrDisplayProps {
  orderId: string;
  amount: number;
  pointsToAdd: number;
  qrCodeData: string;
  qrCodeUrl?: string;
  expiresAt: string;
  transactionId: string;
}

export function DemoQrDisplay({
  orderId,
  amount,
  pointsToAdd,
  qrCodeData,
  qrCodeUrl,
  expiresAt,
  transactionId,
}: DemoQrDisplayProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    toast({
      title: "คัดลอกแล้ว",
      description: "รหัส Order ID ถูกคัดลอกแล้ว",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = new Date(expiresAt) < new Date();

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-[#ff4b00]" />
          QR Code สำหรับชำระเงิน
        </CardTitle>
        <CardDescription>
          สแกน QR Code เพื่อเติมเงิน (Demo Mode)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-gray-200">
          {qrCodeData ? (
            <img
              src={qrCodeData}
              alt="PromptPay QR Code"
              className="max-w-full h-auto"
              style={{ maxWidth: "300px", maxHeight: "300px" }}
            />
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Order Info */}
        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">จำนวนเงิน:</span>
            <span className="text-lg font-bold text-[#ff4b00]">
              {amount.toLocaleString()} บาท
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">แต้มที่จะได้รับ:</span>
            <span className="text-lg font-semibold text-green-600">
              {pointsToAdd.toLocaleString()} แต้ม
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">รหัส Order:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm">{orderId}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyOrderId}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">หมดอายุ:</span>
            <span
              className={`text-sm font-medium ${
                isExpired ? "text-red-600" : "text-gray-700"
              }`}
            >
              {format(new Date(expiresAt), "dd/MM/yyyy HH:mm")}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {isExpired && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 text-center">
              QR Code หมดอายุแล้ว กรุณาสร้าง Order ใหม่
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700 text-center">
            <strong>หมายเหตุ:</strong> นี่คือระบบ Demo สำหรับทดสอบ
            <br />
            การชำระเงินจะไม่ถูกเรียกเก็บจริง
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

