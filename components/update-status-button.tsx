"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateRedemptionStatus } from "@/app/actions/redemptions";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

interface UpdateStatusButtonProps {
  redemptionId: string;
  currentStatus: string;
}

export function UpdateStatusButton({
  redemptionId,
  currentStatus,
}: UpdateStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleUpdate = async () => {
    setIsUpdating(true);
    const result = await updateRedemptionStatus(redemptionId, "completed");
    
    if (result.success) {
      toast({
        title: "สำเร็จ",
        description: result.message,
      });
      router.refresh();
    } else {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: result.message,
        variant: "destructive",
      });
    }
    setIsUpdating(false);
  };

  return (
    <Button
      size="sm"
      onClick={handleUpdate}
      disabled={isUpdating || currentStatus === "completed"}
    >
      <Check className="mr-2 h-4 w-4" />
      {isUpdating ? "กำลังอัปเดต..." : "ทำเครื่องหมายเสร็จสิ้น"}
    </Button>
  );
}

