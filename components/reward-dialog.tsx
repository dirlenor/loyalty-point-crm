"use client";

import { useState } from "react";
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
import { createReward, updateReward } from "@/app/actions/rewards";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const rewardSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อรางวัล"),
  description: z.string().optional(),
  points_required: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, "แต้มต้องมากกว่า 0"),
  stock: z.string().refine((val) => {
    const num = parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "สต็อกต้องมากกว่าหรือเท่ากับ 0"),
  image_url: z.string().url().optional().or(z.literal("")),
});

type RewardFormData = z.infer<typeof rewardSchema>;

interface RewardDialogProps {
  children: React.ReactNode;
  reward?: {
    id: string;
    title: string;
    description?: string | null;
    points_required: number;
    stock: number;
    image_url?: string | null;
  };
}

export function RewardDialog({ children, reward }: RewardDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RewardFormData>({
    resolver: zodResolver(rewardSchema),
    defaultValues: reward
      ? {
          title: reward.title,
          description: reward.description || "",
          points_required: reward.points_required.toString(),
          stock: reward.stock.toString(),
          image_url: reward.image_url || "",
        }
      : undefined,
  });

  const onSubmit = async (data: RewardFormData) => {
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description || "");
    formData.append("points_required", data.points_required);
    formData.append("stock", data.stock);
    formData.append("image_url", data.image_url || "");

    const result = reward
      ? await updateReward(reward.id, formData)
      : await createReward(formData);

    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setOpen(false);
      reset();
      router.refresh();
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{reward ? "แก้ไขรางวัล" : "เพิ่มรางวัลใหม่"}</DialogTitle>
          <DialogDescription>
            {reward ? "แก้ไขข้อมูลรางวัล" : "กรอกข้อมูลรางวัลใหม่"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">ชื่อรางวัล *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="เช่น คูปองส่วนลด 10%"
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
                placeholder="รายละเอียดรางวัล"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points_required">แต้มที่ใช้ *</Label>
              <Input
                id="points_required"
                type="number"
                {...register("points_required")}
                placeholder="100"
                min="1"
              />
              {errors.points_required && (
                <p className="text-sm text-destructive">{errors.points_required.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="stock">สต็อก *</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock")}
                placeholder="10"
                min="0"
              />
              {errors.stock && (
                <p className="text-sm text-destructive">{errors.stock.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="image_url">URL รูปภาพ</Label>
              <Input
                id="image_url"
                type="url"
                {...register("image_url")}
                placeholder="https://example.com/image.jpg"
              />
              {errors.image_url && (
                <p className="text-sm text-destructive">{errors.image_url.message}</p>
              )}
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
              {isSubmitting ? "กำลังบันทึก..." : reward ? "อัปเดต" : "สร้าง"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

