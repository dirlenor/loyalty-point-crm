"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createRedemption } from "@/app/actions/redemptions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Gift } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { findProfileByLineUserId } from "@/app/actions/profiles";

interface CustomerRedeemButtonProps {
  reward: {
    id: string;
    title: string;
    points_required: number;
    stock: number;
  };
}

export function CustomerRedeemButton({ reward }: CustomerRedeemButtonProps) {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadCustomer = async () => {
      const lineUserId = localStorage.getItem("line_user_id");
      if (lineUserId) {
        const result = await findProfileByLineUserId(lineUserId);
        if (result.success && result.data) {
          setCustomer(result.data);
        }
      }
    };
    loadCustomer();
  }, []);

  const handleRedeem = async () => {
    if (!customer) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาเข้าสู่ระบบก่อน",
        variant: "destructive",
      });
      return;
    }

    if (reward.stock <= 0) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "สินค้าหมดสต็อก",
        variant: "destructive",
      });
      return;
    }

    if ((customer.total_points || 0) < reward.points_required) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "แต้มไม่พอสำหรับแลกรางวัลนี้",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    const result = await createRedemption(customer.id, reward.id);
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setOpen(false);
      router.refresh();
      // Reload customer data
      const lineUserId = localStorage.getItem("line_user_id");
      if (lineUserId) {
        const customerResult = await findProfileByLineUserId(lineUserId);
        if (customerResult.success && customerResult.data) {
          setCustomer(customerResult.data);
          localStorage.setItem("customer_points", customerResult.data.total_points?.toString() || "0");
        }
      }
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsRedeeming(false);
  };

  if (!customer) {
    return (
      <Button className="w-full" disabled>
        <Gift className="mr-2 h-4 w-4" />
        กำลังโหลด...
      </Button>
    );
  }

  const canRedeem = customer.total_points >= reward.points_required && reward.stock > 0;

  return (
    <>
      <Button
        className="w-full"
        onClick={() => setOpen(true)}
        disabled={!canRedeem}
      >
        <Gift className="mr-2 h-4 w-4" />
        {reward.stock === 0
          ? "สินค้าหมด"
          : customer.total_points < reward.points_required
          ? "แต้มไม่พอ"
          : "แลกรางวัล"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>แลกรางวัล: {reward.title}</DialogTitle>
            <DialogDescription>
              ใช้แต้ม {reward.points_required} แต้ม
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">ชื่อ</p>
                  <p className="font-semibold">{customer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">แต้มปัจจุบัน</p>
                  <p className="text-xl font-bold text-green-600">
                    {customer.total_points || 0} แต้ม
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">แต้มหลังแลก</p>
                  <p className="text-lg font-semibold text-[#00D084]">
                    {(customer.total_points || 0) - reward.points_required} แต้ม
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isRedeeming}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={
                isRedeeming ||
                reward.stock <= 0 ||
                (customer.total_points || 0) < reward.points_required
              }
            >
              {isRedeeming ? "กำลังแลก..." : "ยืนยันการแลก"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

