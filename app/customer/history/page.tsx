"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerLayout } from "@/components/customer-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Gift, QrCode } from "lucide-react";
import { findProfileByLineUserId } from "@/app/actions/profiles";
import { getCustomerRedemptions } from "@/app/actions/customer-redemptions";
import { QRCodeSVG } from "qrcode.react";

export default function CustomerHistoryPage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
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
          
          // Load redemptions for this customer
          const redemptionsData = await getCustomerRedemptions(customerResult.data.id);
          setRedemptions(redemptionsData);
        } else {
          router.push("/customer/login");
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
          <p>กำลังโหลด...</p>
        </div>
      </CustomerLayout>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <CustomerLayout>
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#211c37] mb-2">
            ประวัติการแลกรางวัล
          </h1>
          <p className="text-[#85878d]">
            ดูประวัติการแลกรางวัลทั้งหมดของคุณ
          </p>
        </div>

        {redemptions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              ยังไม่มีประวัติการแลกรางวัล
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {redemptions.map((redemption: any) => (
              <div
                key={redemption.id}
                className="bg-white border border-[#e4e4e4] rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {redemption.rewards?.image_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={redemption.rewards.image_url}
                        alt={redemption.rewards.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-base text-[#1c1d1d] truncate">
                        {redemption.rewards?.title || "ไม่ระบุ"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={
                          redemption.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200 text-xs"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                        }
                      >
                        {redemption.status === "completed" ? "เสร็จสิ้น" : "รอดำเนินการ"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>
                        {format(new Date(redemption.created_at), "dd/MM/yyyy HH:mm")}
                      </span>
                      <span>•</span>
                      <span className="text-[#00D084] font-semibold">
                        {redemption.rewards?.points_required || 0} แต้ม
                      </span>
                    </div>
                    {redemption.redemption_code && redemption.status === "pending" && (
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRedemption(redemption);
                            setQrDialogOpen(true);
                          }}
                          className="text-xs"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          แสดง QR Code
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          รหัส: <span className="font-mono font-semibold">{redemption.redemption_code}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code สำหรับรับรางวัล</DialogTitle>
              <DialogDescription>
                แสดง QR Code นี้ที่หน้าร้านเพื่อรับรางวัล
              </DialogDescription>
            </DialogHeader>
            {selectedRedemption && (
              <div className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                  <QRCodeSVG
                    value={selectedRedemption.redemption_code || ""}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>

                {/* Redemption Code */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">รหัสรับรางวัล</p>
                  <p className="text-2xl font-mono font-bold text-[#00D084]">
                    {selectedRedemption.redemption_code}
                  </p>
                </div>

                {/* Reward Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">
                    {selectedRedemption.rewards?.title || "ไม่ระบุ"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    ใช้แต้ม: {selectedRedemption.rewards?.points_required || 0} แต้ม
                  </p>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  กรุณาแสดง QR Code หรือรหัสนี้ที่หน้าร้านเพื่อรับรางวัล
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CustomerLayout>
  );
}

