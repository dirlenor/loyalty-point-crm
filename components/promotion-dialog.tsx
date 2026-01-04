"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPromotion, updatePromotion } from "@/app/actions/promotions";
import { uploadPromotionImage } from "@/lib/supabase/storage";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

const promotionSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อโปรโมชั่น"),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionDialogProps {
  children: React.ReactNode;
  promotion?: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    is_active: boolean;
  };
  onSuccess?: () => void;
}

export function PromotionDialog({ children, promotion, onSuccess }: PromotionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(promotion?.image_url || null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(promotion?.image_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: promotion
      ? {
          title: promotion.title,
          description: promotion.description || "",
          image_url: promotion.image_url || "",
          is_active: promotion.is_active,
        }
      : {
          is_active: true,
        },
  });

  const isActive = watch("is_active");

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "ไฟล์ไม่ถูกต้อง",
        description: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10 MB
    if (file.size > maxSize) {
      toast({
        title: "ไฟล์ใหญ่เกินไป",
        description: "ขนาดไฟล์ต้องไม่เกิน 10 MB",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;

    setIsUploading(true);
    try {
      const { url } = await uploadPromotionImage(imageFile);
      setUploadedImageUrl(url);
      setValue("image_url", url);
      toast({
        title: "อัปโหลดสำเร็จ",
        description: "อัปโหลดรูปภาพสำเร็จแล้ว",
      });
    } catch (error: any) {
      toast({
        title: "อัปโหลดล้มเหลว",
        description: error.message || "เกิดข้อผิดพลาดในการอัปโหลด",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    setValue("image_url", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: PromotionFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("image_url", uploadedImageUrl || data.image_url || "");
    formData.append("is_active", data.is_active.toString());

    const result = promotion
      ? await updatePromotion(promotion.id, formData)
      : await createPromotion(formData);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setOpen(false);
      reset();
      setImageFile(null);
      setImagePreview(null);
      setUploadedImageUrl(null);
      if (onSuccess) {
        onSuccess();
      }
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promotion ? "แก้ไขโปรโมชั่น" : "เพิ่มโปรโมชั่นใหม่"}</DialogTitle>
          <DialogDescription>
            {promotion ? "แก้ไขข้อมูลโปรโมชั่น" : "กรอกข้อมูลโปรโมชั่นใหม่"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">ชื่อโปรโมชั่น *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="เช่น โปรโมชั่นพิเศษ 50%"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="รายละเอียดโปรโมชั่น"
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image">รูปภาพ</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                disabled={isUploading || !!uploadedImageUrl}
              />
              <p className="text-sm text-muted-foreground">
                รองรับไฟล์ JPG, PNG ขนาดสูงสุด 10 MB
              </p>
              {imagePreview && !uploadedImageUrl && (
                <div className="space-y-2">
                  <div className="relative w-full max-w-xs aspect-video border rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        กำลังอัปโหลด...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        อัปโหลดรูปภาพ
                      </>
                    )}
                  </Button>
                </div>
              )}
              {uploadedImageUrl && (
                <div className="space-y-2">
                  <div className="relative w-full max-w-xs aspect-video border rounded-lg overflow-hidden">
                    <Image
                      src={uploadedImageUrl}
                      alt="Uploaded"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleRemoveImage}
                    variant="destructive"
                    className="w-full"
                  >
                    <X className="mr-2 h-4 w-4" />
                    ลบรูปภาพ
                  </Button>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="image_url">หรือใส่ URL รูปภาพ</Label>
                <Input
                  id="image_url"
                  type="url"
                  {...register("image_url")}
                  placeholder="https://example.com/image.jpg"
                  disabled={!!uploadedImageUrl}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register("is_active")}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  เปิดการแสดงผล
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : promotion ? "อัปเดต" : "สร้าง"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

