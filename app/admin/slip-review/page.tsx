"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  getSlipSubmissions,
  approveSlipSubmission,
  rejectSlipSubmission,
} from "@/app/actions/slip-submissions";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, Loader2 } from "lucide-react";
import Image from "next/image";

export default function SlipReviewPage() {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [pointsOverride, setPointsOverride] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"pending" | "all">("pending");

  useEffect(() => {
    loadSubmissions();
  }, [statusFilter]);

  const loadSubmissions = async () => {
    setIsLoading(true);
    try {
      const result = await getSlipSubmissions(
        statusFilter === "all" ? undefined : statusFilter
      );
      if (result.success && result.data) {
        setSubmissions(result.data);
        setFilteredSubmissions(result.data);
      }
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setPointsOverride(submission.points_awarded?.toString() || "");
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    const points = pointsOverride
      ? parseInt(pointsOverride)
      : selectedSubmission.points_awarded || 0;

    if (points <= 0) {
      toast({
        title: "กรุณากรอกจำนวนแต้ม",
        description: "จำนวนแต้มต้องมากกว่า 0",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Get admin ID from localStorage or use a default
      const adminId = "00000000-0000-0000-0000-000000000000"; // TODO: Get from auth

      const result = await approveSlipSubmission(
        selectedSubmission.id,
        adminId,
        points
      );

      if (result.success) {
        toast({
          title: "อนุมัติสลิปสำเร็จ",
          description: result.message,
        });
        setReviewDialogOpen(false);
        setSelectedSubmission(null);
        loadSubmissions();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอนุมัติสลิปได้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      toast({
        title: "กรุณาระบุเหตุผล",
        description: "กรุณาระบุเหตุผลในการปฏิเสธ",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const adminId = "00000000-0000-0000-0000-000000000000"; // TODO: Get from auth

      const result = await rejectSlipSubmission(
        selectedSubmission.id,
        adminId,
        rejectionReason
      );

      if (result.success) {
        toast({
          title: "ปฏิเสธสลิปสำเร็จ",
          description: result.message,
        });
        setRejectDialogOpen(false);
        setReviewDialogOpen(false);
        setSelectedSubmission(null);
        setRejectionReason("");
        loadSubmissions();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถปฏิเสธสลิปได้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            รอตรวจสอบ
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            อนุมัติแล้ว
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            ปฏิเสธ
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1c1d1d] mb-2">
            ตรวจสอบสลิปเงินโอน
          </h1>
          <p className="text-sm text-[#6b7280]">
            ตรวจสอบและอนุมัติสลิปเงินโอนที่ลูกค้าอัปโหลด
          </p>
        </div>

        {/* Filter */}
        <div className="mb-4 flex gap-2">
          <Button
            variant={statusFilter === "pending" ? "default" : "outline"}
            onClick={() => setStatusFilter("pending")}
            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
          >
            รอตรวจสอบ
          </Button>
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
          >
            ทั้งหมด
          </Button>
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-[#6b7280]" />
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-[#6b7280]">ไม่มีสลิปรอตรวจสอบ</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSubmissions.map((submission) => (
              <Card key={submission.id} className="bg-white border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Image Preview */}
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border flex-shrink-0">
                      <Image
                        src={submission.image_url}
                        alt="Slip"
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-[#1c1d1d]">
                            {submission.customer?.full_name || "ไม่ระบุชื่อ"}
                          </p>
                          <p className="text-sm text-[#6b7280]">
                            {submission.customer?.phone || "ไม่ระบุเบอร์"}
                          </p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                          <span className="text-[#6b7280]">จำนวนเงิน: </span>
                          <span className="font-medium text-[#1c1d1d]">
                            {submission.amount
                              ? `${submission.amount.toLocaleString()} บาท`
                              : "ไม่ระบุ"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6b7280]">แต้มที่จะได้รับ: </span>
                          <span className="font-medium text-[#ff4b00]">
                            {submission.points_awarded || 0} แต้ม
                          </span>
                        </div>
                        {submission.reference_number && (
                          <div>
                            <span className="text-[#6b7280]">เลขที่อ้างอิง: </span>
                            <span className="font-medium text-[#1c1d1d]">
                              {submission.reference_number}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-[#6b7280]">วันที่ส่ง: </span>
                          <span className="font-medium text-[#1c1d1d]">
                            {format(
                              new Date(submission.created_at),
                              "dd/MM/yyyy HH:mm"
                            )}
                          </span>
                        </div>
                      </div>

                      {submission.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                            className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            ตรวจสอบ
                          </Button>
                        </div>
                      )}

                      {submission.status === "rejected" &&
                        submission.rejection_reason && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <strong>เหตุผล: </strong>
                            {submission.rejection_reason}
                          </div>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ตรวจสอบสลิปเงินโอน</DialogTitle>
              <DialogDescription>
                ตรวจสอบข้อมูลสลิปและอนุมัติหรือปฏิเสธ
              </DialogDescription>
            </DialogHeader>

            {selectedSubmission && (
              <div className="space-y-4">
                {/* Customer Info */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm mb-1">ข้อมูลลูกค้า</p>
                  <p className="text-sm text-[#6b7280]">
                    {selectedSubmission.customer?.full_name || "ไม่ระบุชื่อ"}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    {selectedSubmission.customer?.phone || "ไม่ระบุเบอร์"}
                  </p>
                  <p className="text-sm text-[#6b7280]">
                    แต้มปัจจุบัน:{" "}
                    <span className="font-medium text-[#ff4b00]">
                      {selectedSubmission.customer?.total_points || 0} แต้ม
                    </span>
                  </p>
                </div>

                {/* Slip Image */}
                <div>
                  <Label>รูปสลิป</Label>
                  <div className="relative w-full h-64 border rounded-lg overflow-hidden mt-2">
                    <Image
                      src={selectedSubmission.image_url}
                      alt="Slip"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* OCR Results */}
                {selectedSubmission.ocr_result && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      ผลการอ่าน OCR
                    </p>
                    <p className="text-xs text-blue-700 whitespace-pre-wrap">
                      {selectedSubmission.ocr_result.rawText || "ไม่มีข้อมูล"}
                    </p>
                    {selectedSubmission.ocr_confidence && (
                      <p className="text-xs text-blue-600 mt-1">
                        ความมั่นใจ:{" "}
                        {Math.round(selectedSubmission.ocr_confidence * 100)}%
                      </p>
                    )}
                  </div>
                )}

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={
                        selectedSubmission.amount?.toString() || ""
                      }
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">จำนวนแต้มที่จะได้รับ</Label>
                    <Input
                      id="points"
                      type="number"
                      value={pointsOverride}
                      onChange={(e) => setPointsOverride(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>

                {selectedSubmission.reference_number && (
                  <div className="space-y-2">
                    <Label>เลขที่อ้างอิง</Label>
                    <Input
                      value={selectedSubmission.reference_number}
                      disabled
                    />
                  </div>
                )}

                {selectedSubmission.transfer_date && (
                  <div className="space-y-2">
                    <Label>วันที่โอน</Label>
                    <Input
                      value={format(
                        new Date(selectedSubmission.transfer_date),
                        "dd/MM/yyyy HH:mm"
                      )}
                      disabled
                    />
                  </div>
                )}
              </div>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(true);
                }}
                disabled={isProcessing}
              >
                <XCircle className="w-4 h-4 mr-2" />
                ปฏิเสธ
              </Button>
              <Button
                onClick={handleApprove}
                disabled={isProcessing}
                className="bg-[#ff4b00] hover:bg-[#ff4b00]/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    อนุมัติ
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ปฏิเสธสลิป</DialogTitle>
              <DialogDescription>
                กรุณาระบุเหตุผลในการปฏิเสธสลิปนี้
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">เหตุผล</Label>
                <Input
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="ระบุเหตุผล..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectDialogOpen(false)}
                disabled={isProcessing}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                variant="destructive"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังประมวลผล...
                  </>
                ) : (
                  "ยืนยันการปฏิเสธ"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

