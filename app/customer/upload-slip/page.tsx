"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CustomerLayout } from "@/components/customer-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { findProfileByLineUserId } from "@/app/actions/profiles";
import { createSlipSubmission } from "@/app/actions/slip-submissions";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function UploadSlipPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [customer, setCustomer] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    date: "",
    referenceNumber: "",
  });

  // Load customer data
  useEffect(() => {
    const loadCustomer = async () => {
      const lineUserId = localStorage.getItem("line_user_id");
      if (!lineUserId) {
        router.push("/customer/login");
        return;
      }

      const result = await findProfileByLineUserId(lineUserId);
      if (result.success && result.data) {
        setCustomer(result.data);
      } else {
        router.push("/customer/login");
      }
    };
    loadCustomer();
  }, [router]);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "รูปแบบไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกรูปภาพประเภท JPEG, PNG หรือ WebP",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setOcrResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Process OCR
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("customerId", customer?.id || "");

      const response = await fetch("/api/upload-slip", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setOcrResult(result.data.ocr);
        // Pre-fill form with OCR results
        if (result.data.ocr.parsed.amount) {
          setFormData((prev) => ({
            ...prev,
            amount: result.data.ocr.parsed.amount.toString(),
          }));
        }
        if (result.data.ocr.parsed.date) {
          setFormData((prev) => ({
            ...prev,
            date: result.data.ocr.parsed.date,
          }));
        }
        if (result.data.ocr.parsed.referenceNumber) {
          setFormData((prev) => ({
            ...prev,
            referenceNumber: result.data.ocr.parsed.referenceNumber,
          }));
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: result.error || "ไม่สามารถประมวลผล OCR ได้",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถอัปโหลดไฟล์ได้",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile || !customer) {
      toast({
        title: "กรุณาเลือกรูปภาพ",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "กรุณากรอกจำนวนเงิน",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload file and get image URL
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);
      uploadFormData.append("customerId", customer.id);

      const uploadResponse = await fetch("/api/upload-slip", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "ไม่สามารถอัปโหลดไฟล์ได้");
      }

      // Create slip submission
      const result = await createSlipSubmission({
        customerId: customer.id,
        imageUrl: uploadResult.data.imageUrl,
        amount: parseFloat(formData.amount),
        referenceNumber: formData.referenceNumber || null,
        transferDate: formData.date || null,
        ocrResult: ocrResult,
        ocrConfidence: ocrResult?.confidence || null,
      });

      if (result.success) {
        toast({
          title: "ส่งสลิปสำเร็จ",
          description: "สลิปของคุณถูกส่งให้ Admin ตรวจสอบแล้ว",
        });
        // Reset form
        setSelectedFile(null);
        setPreviewUrl(null);
        setOcrResult(null);
        setFormData({ amount: "", date: "", referenceNumber: "" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถส่งสลิปได้",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>อัปโหลดสลิปเงินโอน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>เลือกรูปภาพสลิป</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  เลือกไฟล์
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  ถ่ายรูป
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="space-y-2">
                <Label>ภาพตัวอย่าง</Label>
                <div className="relative w-full h-64 border rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Slip preview"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}

            {/* OCR Processing Status */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังประมวลผล OCR...</span>
              </div>
            )}

            {/* OCR Results */}
            {ocrResult && !isProcessing && (
              <div className="space-y-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                  {ocrResult.confidence > 0.7 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-yellow-600" />
                  )}
                  <span>
                    ผลการอ่าน OCR (ความมั่นใจ:{" "}
                    {Math.round(ocrResult.confidence * 100)}%)
                  </span>
                </div>
                {ocrResult.rawText && (
                  <p className="text-xs text-blue-700 line-clamp-3">
                    {ocrResult.rawText}
                  </p>
                )}
              </div>
            )}

            {/* Form Fields */}
            {selectedFile && (
              <div className="space-y-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    จำนวนเงิน (บาท) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">วันที่โอน</Label>
                  <Input
                    id="date"
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referenceNumber">เลขที่อ้างอิง</Label>
                  <Input
                    id="referenceNumber"
                    type="text"
                    placeholder="เลขที่อ้างอิง (ถ้ามี)"
                    value={formData.referenceNumber}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        referenceNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.amount}
                  className="w-full bg-[#ff4b00] hover:bg-[#ff4b00]/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      กำลังส่ง...
                    </>
                  ) : (
                    "ส่งให้ Admin ตรวจสอบ"
                  )}
                </Button>
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• กรุณาอัปโหลดรูปภาพสลิปเงินโอนที่ชัดเจน</p>
              <p>• ระบบจะอ่านข้อมูลอัตโนมัติ แต่คุณสามารถแก้ไขได้</p>
              <p>• Admin จะตรวจสอบและอนุมัติก่อนเพิ่มแต้มให้</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}

