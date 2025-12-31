"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findProfileByPhone } from "@/app/actions/profiles";

interface RedeemButtonProps {
  reward: {
    id: string;
    title: string;
    points_required: number;
    stock: number;
  };
}

export function RedeemButton({ reward }: RedeemButtonProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleSearch = async () => {
    if (!phone || phone.length !== 10) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณากรอกเบอร์โทรศัพท์ 10 หลัก",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    const result = await findProfileByPhone(phone);
    
    if (result.success && result.data) {
      setProfile(result.data);
    } else {
      setProfile(null);
      toast({
        title: "ไม่พบข้อมูล",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsSearching(false);
  };

  const handleRedeem = async () => {
    if (!profile) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "กรุณาค้นหาลูกค้าก่อน",
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

    if ((profile.total_points || 0) < reward.points_required) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "แต้มไม่พอสำหรับแลกรางวัลนี้",
        variant: "destructive",
      });
      return;
    }

    setIsRedeeming(true);
    const result = await createRedemption(profile.id, reward.id);
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      setOpen(false);
      setPhone("");
      setProfile(null);
      router.refresh();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsRedeeming(false);
  };

  return (
    <>
      <Button
        className="w-full"
        onClick={() => setOpen(true)}
        disabled={reward.stock === 0}
      >
        <Gift className="mr-2 h-4 w-4" />
        {reward.stock === 0 ? "สินค้าหมด" : "แลกรางวัล"}
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
            <div className="space-y-2">
              <Label htmlFor="redeem-phone">เบอร์โทรศัพท์</Label>
              <div className="flex gap-2">
                <Input
                  id="redeem-phone"
                  type="tel"
                  placeholder="0812345678"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setPhone(value);
                      setProfile(null);
                    }
                  }}
                  maxLength={10}
                />
                <Button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !phone || phone.length !== 10}
                >
                  {isSearching ? "กำลังค้นหา..." : "ค้นหา"}
                </Button>
              </div>
            </div>

            {profile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div>
                  <Label className="text-sm text-muted-foreground">ชื่อ</Label>
                  <p className="font-semibold">{profile.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">แต้มปัจจุบัน</Label>
                  <p className="text-xl font-bold text-green-600">
                    {profile.total_points || 0} แต้ม
                  </p>
                </div>
                {profile.total_points < reward.points_required && (
                  <p className="text-sm text-red-600 font-semibold">
                    ⚠️ แต้มไม่พอสำหรับแลกรางวัลนี้
                  </p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setPhone("");
                setProfile(null);
              }}
              disabled={isRedeeming}
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleRedeem}
              disabled={
                isRedeeming ||
                !profile ||
                reward.stock <= 0 ||
                (profile.total_points || 0) < reward.points_required
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

